<script setup lang="ts">
import type {IHtmlNode, StyleVariant} from "~/types/constructor";
import {type BlockKind, blockPresets} from "~/constants/constructor/baseBlock";
import {voidTags} from "~/constants/constructor/tags";
import {getNodesPath} from "~/utils/constructor/getNodesPath";
import {cloneNode, getBlockNumber, getChildId, reindexChildren} from "~/utils/constructor/getId";
import {createPageNode} from "~/utils/constructor/page";
import {parseImportedPage, parsePageContent} from "~/utils/constructor/import";
import {buildEditorCss, buildPageCss} from "~/utils/constructor/pageCss";
import {getBreakpoint} from "~/constants/constructor/breakpoints";
import {buildPageBodyHtml, buildPreviewHtml} from "~/utils/constructor/exportHtml";

const {$api} = useNuxtApp();
const assetSrc = useAssetSrc();

/** Чем закончилось последнее действие с файлом — это видно в панели */
const fileMessage = ref('');
const fileFailed = ref(false);

const setFileMessage = (message: string, failed = false) => {
  fileMessage.value = message;
  fileFailed.value = failed;
}

/**
 * Сохранённую страницу тянем уже в браузере: редактор открывается сразу
 * и работает, даже когда сервер молчит.
 */
const {data: page, status: pageStatus} = useAsyncData<IHtmlNode>('current-file', async () => {
  setFileMessage('Загружаем страницу…');

  try {
    const res = await $api.fileManager.getFile();
    setFileMessage('');

    return reactive(parsePageContent(res));
  } catch {
    // файла ещё нет, он испорчен или сервер недоступен — начинаем с пустой страницы
    setFileMessage('Не удалось загрузить сохранённую страницу', true);

    return reactive(createPageNode());
  }
}, {
  default: () => reactive(createPageNode()),
  server: false,
  lazy: true,
})

/** Журнал правок: он сам следит за деревом и умеет возвращать его назад */
const history = usePageHistory(page);
const {entries: actions, isTrimmed: actionsTrimmed} = history;

/** Загруженная страница — начало журнала, а не первое действие в нём */
watch(pageStatus, (value) => {
  if (value !== 'pending') {
    history.reset();
  }
});

const currentTarget = ref<Nullable<string>>(null);
/** Контрольная точка, которую сейчас правят и показывают на холсте */
const currentVariant = ref<StyleVariant>('xl');

const isImportOpen = ref(false);
/** Ошибка разбора json — её видно в окне импорта */
const importError = ref('');

const blocks = computed(() => page.value.children as IHtmlNode[]);

/** Css для файла и превью — с медиазапросами по контрольным точкам */
const pageCss = computed(() => buildPageCss(page.value));

/** Css для холста — страница такой, какой она будет на выбранной ширине */
const editorCss = computed(() => buildEditorCss(page.value, currentVariant.value));

const canvasWidth = computed(() => getBreakpoint(currentVariant.value).canvasWidth);

useHead({
  style: [{id: 'constructor-page', innerHTML: editorCss}]
});

/** Цепочка блоков от самого главного до выбранного — по ней работают хлебные крошки */
const currentTargetPath = computed(() => {
  return currentTarget.value ? getNodesPath(blocks.value, currentTarget.value) : [];
})

/** Когда ни один блок не выбран, редактируется сама страница */
const currentTargetBlock = computed(() => currentTargetPath.value.at(-1) ?? page.value);

/** Внутрь пустого тега вкладывать нечего, поэтому новый блок уходит к его соседям */
const addTarget = computed(() => {
  const target = currentTargetBlock.value;
  return voidTags.has(target.tag) ? currentTargetPath.value.at(-2) ?? page.value : target;
})

const addBlock = (kind: BlockKind = 'block') => {
  const target = addTarget.value;
  const newBlock = structuredClone(blockPresets[kind]);

  target.children.push({
    ...newBlock,
    id: getChildId(target)
  });
}

/**
 * Буфер обмена редактора: в нём лежит слепок блока, а не сам блок,
 * поэтому правки оригинала после копирования в копию уже не попадают.
 * shallowRef — чтобы слепок оставался обычным объектом и поддавался клонированию.
 */
const clipboard = shallowRef<Nullable<IHtmlNode>>(null);

/** Копируется только выбранный блок: страницу целиком в саму себя не вкладываем */
const copyBlock = () => {
  if (!currentTarget.value) {
    return;
  }

  clipboard.value = structuredClone(toRaw(currentTargetBlock.value));
  setFileMessage('Скопировали блок');
}

/** Копия уходит туда же, куда и новый блок — внутрь выбранного */
const pasteBlock = () => {
  if (!clipboard.value) {
    return;
  }

  const target = addTarget.value;
  const id = getChildId(target);

  history.describe(`Вставили копию (блок ${getBlockNumber(id)})`);
  target.children.push(cloneNode(clipboard.value, id));
  setFileMessage('Вставили копию блока');
}

/**
 * Удаление блока: соседи сдвигаются на его место, поэтому им раздаются новые id —
 * id блока это и есть его место в дереве. Выбранным становится родитель,
 * ведь удалённого блока больше нет.
 */
const removeBlock = () => {
  const target = currentTargetBlock.value;
  // страница — не блок: удалять её нечем и незачем
  const parent = target === page.value ? null : currentTargetPath.value.at(-2) ?? page.value;

  if (!parent) {
    return;
  }

  const index = parent.children.findIndex((child) => typeof child !== 'string' && child.id === target.id);

  if (index === -1) {
    return;
  }

  history.describe(`Удалили блок ${getBlockNumber(target.id)}`);
  parent.children.splice(index, 1);
  reindexChildren(parent);

  currentTarget.value = parent === page.value ? null : parent.id;
  setFileMessage('Удалили блок');
}

/**
 * Отмена возвращает страницу к состоянию перед действием: выбранного
 * блока после этого может и не быть — тогда редактируется снова вся страница.
 */
const undoAction = (entryId?: number) => {
  const title = history.undo(entryId);

  if (!title) {
    setFileMessage('Отменять пока нечего');
    return;
  }

  if (currentTarget.value && !currentTargetPath.value.length) {
    currentTarget.value = null;
  }

  setFileMessage(`Отменили: ${title.toLowerCase()}`);
}

/** Пока правят текст или значение в панели, клавиши достаются им */
const isTyping = (target: EventTarget | null) => {
  return !!(target as Nullable<HTMLElement>)?.closest?.('input, textarea, select, [contenteditable]');
}

/**
 * Горячие клавиши разбираются по самой клавише, а не по букве на ней: в русской
 * раскладке та же ctrl+c приходит как ctrl+с. Ctrl (он же cmd на маке) — часть
 * сочетания, поэтому он записан прямо в ключе: delete работает и без него.
 */
const shortcuts: Record<string, () => void> = {
  'ctrl+KeyC': copyBlock,
  'ctrl+KeyV': pasteBlock,
  'ctrl+KeyZ': undoAction,
  'Delete': removeBlock,
}

const getShortcut = (event: KeyboardEvent) => {
  return `${event.ctrlKey || event.metaKey ? 'ctrl+' : ''}${event.code}`;
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.altKey || isTyping(event.target)) {
    return;
  }

  const shortcut = getShortcut(event);
  const action = shortcuts[shortcut];

  if (!action) {
    return;
  }

  // браузеру тут отменять нечего: правки живут в дереве страницы,
  // а вот копирование выделенного текста оставляем браузеру
  if (shortcut === 'ctrl+KeyZ') {
    event.preventDefault();
  }

  action();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

const openImport = () => {
  importError.value = '';
  setFileMessage('');
  isImportOpen.value = true;
}

/** Импорт заменяет страницу целиком, поэтому выбранный блок сбрасываем */
const importJson = (json: string) => {
  try {
    const imported = parseImportedPage(json);

    history.describe('Импортировали страницу');
    page.value = reactive(imported);
    currentTarget.value = null;
    isImportOpen.value = false;
    setFileMessage(`Загрузили блоков: ${blocks.value.length}. Не забудьте сохранить`);
  } catch (error) {
    importError.value = (error as Error).message;
  }
}

/** Превью собирается прямо в браузере — из того же дерева, что и файл */
const previewPage = () => {
  // у blob-страницы нет адреса, относительно которого искались бы файлы,
  // поэтому резолвер превью разворачивает их в полные адреса
  const html = buildPreviewHtml(page.value, pageCss.value, assetSrc('preview'));
  const preview = new Blob([html], {type: 'text/html'});
  const previewUrl = URL.createObjectURL(preview);

  if (window.open(previewUrl, '_blank')) {
    setFileMessage('Превью открыли в новой вкладке');
  } else {
    setFileMessage('Браузер не дал открыть новую вкладку', true);
  }

  // ссылка нужна только на время открытия вкладки, дальше страница живёт сама
  setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
}

const saveFile = async () => {
  try {
    await $api.fileManager.saveFile({
      content: [page.value]
    })
    setFileMessage('Сохранили');
  } catch {
    setFileMessage('Не получилось сохранить', true);
  }
}

/** Архив приходит потоком в ответе — на диск сервера он не попадает */
const saveArchive = (archive: Blob) => {
  const archiveUrl = URL.createObjectURL(archive);
  const link = document.createElement('a');

  link.href = archiveUrl;
  link.download = `${$api.fileManager.projectId}.zip`;
  link.click();

  // ссылка нужна только на время скачивания, дальше файл живёт сам
  setTimeout(() => URL.revokeObjectURL(archiveUrl), 60000);
}

const downloadFile = async () => {
  try {
    // в архиве страница лежит рядом со своей папкой файлов, поэтому
    // и ссылки на них собираются относительными
    const archive = await $api.fileManager.downloadFile({
      content: buildPageBodyHtml(page.value, assetSrc('archive')),
      css: pageCss.value,
    })
    saveArchive(archive);
    await saveFile();
    setFileMessage('Собрали архив: страница и её картинки');
  } catch {
    setFileMessage('Не получилось скачать', true);
  }
}
</script>

<template>
  <div class="flex flex-col gap-[12px] h-full w-fit mx-auto p-[16px]">
    <h1 class="flex items-center justify-center gap-[8px] text-[20px] font-bold text-primary-strong">
      <span>🌸</span>
      Мой конструктор
      <span>🌸</span>
    </h1>

    <ConstructorBreadcrumbs
      :path="currentTargetPath"
      @select-target="currentTarget = $event"
    />

    <div class="flex-1 min-h-0 max-w-full overflow-x-auto">
      <ConstructorField
        :page="page"
        :selected-id="currentTarget"
        :width="canvasWidth"
        @select-target="currentTarget = $event"
      />
    </div>

    <ConstructorToolbarFile
      :message="fileMessage"
      :failed="fileFailed"
      @add-block="addBlock"
      @preview-page="previewPage"
      @save-file="saveFile"
      @download-file="downloadFile"
      @open-import="openImport"
    />
    <ConstructorToolbarBreakpoints
      v-model="currentVariant"
      :current-target="currentTargetBlock"
    />
    <ConstructorToolbarHistory
      :entries="actions"
      :trimmed="actionsTrimmed"
      @undo="undoAction"
    />
    <ConstructorToolbarBlock
      :current-target="currentTargetBlock"
      :variant="currentVariant"
      @remove="removeBlock"
    />

    <ConstructorImportModal
      v-model="isImportOpen"
      :error="importError"
      @import="importJson"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
