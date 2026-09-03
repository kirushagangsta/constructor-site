<script setup lang="ts">
import type {IHtmlNode} from "~/types/constructor";
import {getNodeText, setNodeText} from "~/utils/constructor/text";
import {getNodeClass} from "~/utils/constructor/pageCss";
import {voidTags} from "~/constants/constructor/tags";
import {emptyImageSrc} from "~/constants/constructor/imagePlaceholder";

const props = defineProps({
  /** Узел-страница: его классы и стили применяются к самой рабочей области */
  page: {
    type: Object as PropType<IHtmlNode>,
    required: true
  },
  /** id выбранного блока; null — выбрана вся страница */
  selectedId: {
    type: String as PropType<Nullable<string>>,
    default: null
  },
  /** Ширина рабочей области — под неё и правят выбранную контрольную точку */
  width: {
    type: Number,
    default: 1140
  }
});

const emit = defineEmits(['select-target']);

const field = useTemplateRef('field');

const toEditorSrc = useAssetSrc()('editor');

/** id блока, текст которого сейчас правят прямо на холсте */
const editingId = ref<Nullable<string>>(null);

const selectTarget = (event: MouseEvent, id: Nullable<string>) => {
  // на холсте ссылки не ведут никуда: клик по блоку — это его выбор
  event.preventDefault();
  event.stopPropagation();
  emit('select-target', id);
}

const startTextEditing = (event: MouseEvent, node: IHtmlNode) => {
  // правим тот блок, по которому кликнули, а не его родителя
  event.stopPropagation();
  editingId.value = node.id;
  const block = event.currentTarget as HTMLElement;

  nextTick(() => {
    const editable = block.querySelector(':scope > [data-editing="true"]') as Nullable<HTMLElement>;

    if (!editable) {
      return;
    }

    editable.focus();
    getSelection()?.selectAllChildren(editable);
    getSelection()?.collapseToEnd();
  });
}

/** Блоки приходят из общего дерева конструктора, поэтому текст правится прямо в узле */
const finishTextEditing = (event: Event, node: IHtmlNode) => {
  setNodeText(node, (event.currentTarget as HTMLElement).innerText);
  editingId.value = null;
}

const onTextKeydown = (event: KeyboardEvent, node: IHtmlNode) => {
  const element = event.currentTarget as HTMLElement;

  if (event.key === 'Escape') {
    element.innerText = getNodeText(node);
    element.blur();
  } else if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    element.blur();
  }
}

/**
 * Редактируемым делается только текст блока, а не блок целиком,
 * иначе внутри contenteditable можно было бы снести вложенные блоки.
 */
const createEditableText = (node: IHtmlNode, text: string): VNode => h(
  'span',
  {
    contenteditable: 'plaintext-only',
    'data-editing': 'true',
    onBlur: (event: Event) => finishTextEditing(event, node),
    onKeydown: (event: KeyboardEvent) => onTextKeydown(event, node),
  },
  text
);

/** Свойства vnode, общие для любого блока: свои классы, выбор и подсветка */
const createNodeAttrs = (node: IHtmlNode) => ({
  // ссылки на файлы разворачиваются в адреса сервера: в дереве лежит только id
  ...Object.fromEntries(Object.entries(node.attrs).map(([name, value]) => [name, toEditorSrc(value)])),
  // классы страницы на холст не выводим: их подхватил бы tailwind самого
  // редактора — и, например, "md:flex" сработал бы по ширине окна, а не холста
  class: getNodeClass(node),
  'data-id': node.id,
  'data-selected': node.id === props.selectedId ? 'true' : undefined,
  onClick: (event: MouseEvent) => selectTarget(event, node.id),
});

/** Рекурсивно превращает описание блока в vnode */
const createVNode = (node: IHtmlNode): VNode => {
  /*
   * У пустых тегов нет ни детей, ни текста, поэтому и правки по двойному клику
   * им не нужны: картинке файл выбирают в панели. Файла может ещё не быть —
   * тогда на холсте рисуется заглушка, иначе блок нельзя было бы даже выбрать.
   */
  if (voidTags.has(node.tag)) {
    return h(node.tag, {
      ...createNodeAttrs(node),
      ...(node.tag === 'img' ? {src: toEditorSrc(node.attrs.src) || emptyImageSrc} : {}),
    });
  }

  const isEditing = editingId.value === node.id;
  // правится первый текстовый ребёнок — тот же, в который пишет setNodeText
  const textIndex = node.children.findIndex((child) => typeof child === 'string');

  const children = node.children
    .map((child, index) => {
      if (typeof child !== 'string') {
        return createVNode(child);
      }

      return isEditing && index === textIndex ? createEditableText(node, child) : child;
    })
    .filter((child) => !!child);

  if (isEditing && textIndex === -1) {
    children.unshift(createEditableText(node, ''));
  }

  return h(
    node.tag,
    {
      ...createNodeAttrs(node),
      onDblclick: (event: MouseEvent) => startTextEditing(event, node),
    },
    children
  );
};
</script>

<template>
  <div
    class="flex flex-col h-full bg-surface border-2 border-primary-soft shadow-soft"
    :style="{width: width + 'px'}"
  >
    <!-- Рамка холста: всё украшение снаружи, сама рабочая область остаётся чистой -->
    <div class="flex items-center gap-[6px] px-[12px] py-[7px] bg-surface-muted border-b-2 border-primary-soft">
      <span class="w-[10px] h-[10px] rounded-pill bg-primary"></span>
      <span class="w-[10px] h-[10px] rounded-pill bg-accent"></span>
      <span class="w-[10px] h-[10px] rounded-pill bg-primary-soft"></span>
      <span class="ml-[6px] text-[12px] font-semibold text-ink-muted">Рабочая область · {{ width }}px</span>
      <span class="ml-auto text-[12px] text-ink-muted">двойной клик — правка текста · ctrl+c / ctrl+v — копия блока</span>
    </div>

    <!-- Клик по пустому месту выбирает всю страницу -->
    <div
      class="ui-canvas flex-1 min-h-0 overflow-y-auto"
      @click="selectTarget($event, null)"
    >
      <div
        ref="field"
        :class="getNodeClass(page)"
        :data-selected="selectedId === null ? 'true' : undefined"
      >
        <component
          v-for="node in (page.children as IHtmlNode[])"
          :key="node.id"
          :is="createVNode(node)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
