<script setup lang="ts">
import type {IHtmlNode, StyleVariant} from "~/types/constructor";
import {baseBlock} from "~/constants/constructor/baseBlock";
import {getNodesPath} from "~/utils/constructor/getNodesPath";
import {getTargetId} from "~/utils/constructor/getId";
import {createPageNode} from "~/utils/constructor/page";
import {parseImportedPage, parsePageContent} from "~/utils/constructor/import";
import {buildEditorCss, buildPageCss} from "~/utils/constructor/pageCss";
import {getBreakpoint} from "~/constants/constructor/breakpoints";
import {buildPageBodyHtml, buildPreviewHtml} from "~/utils/constructor/exportHtml";

const {$api} = useNuxtApp();

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
const {data: page} = useAsyncData<IHtmlNode>('current-file', async () => {
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

// TODO доработать систему id
const addBlock = () => {
  const target = currentTargetBlock.value;
  const newBlock = structuredClone(baseBlock);
  const isPage = target === page.value;

  target.children.push({
    ...newBlock,
    id: isPage ? blocks.value.length.toString() : getTargetId(target)
  });
}

const openImport = () => {
  importError.value = '';
  setFileMessage('');
  isImportOpen.value = true;
}

/** Импорт заменяет страницу целиком, поэтому выбранный блок сбрасываем */
const importJson = (json: string) => {
  try {
    page.value = reactive(parseImportedPage(json));
    currentTarget.value = null;
    isImportOpen.value = false;
    setFileMessage(`Загрузили блоков: ${blocks.value.length}. Не забудьте сохранить`);
  } catch (error) {
    importError.value = (error as Error).message;
  }
}

/** Превью собирается прямо в браузере — из того же дерева, что и файл */
const previewPage = () => {
  const preview = new Blob([buildPreviewHtml(page.value, pageCss.value)], {type: 'text/html'});
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

const downloadFile = async () => {
  try {
    const res = await $api.fileManager.downloadFile({
      content: buildPageBodyHtml(page.value),
      css: pageCss.value,
    })
    window.open(res.downloadUrl);
    await saveFile();
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
    <ConstructorToolbarBlock
      :current-target="currentTargetBlock"
      :variant="currentVariant"
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
