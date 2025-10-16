<script setup lang="ts">
import type {IHtmlNode} from "~/types/constructor";
import {baseBlock} from "~/constants/constructor/baseBlock";
import {recursiveFind} from "~/utils/constructor/recursiveFind";
import {getTargetId} from "~/utils/constructor/getId";

const {$api} = useNuxtApp();

const {data: htmlItems} = useAsyncData<IHtmlNode[]>('current-file', async () => {
  const res = await $api.fileManager.getFile();
  const parsed = JSON.parse(res) || [];
  return reactive(parsed as IHtmlNode[]);
}, {
  default: () => reactive([] as IHtmlNode[]),
})

const currentTarget = ref<Nullable<string>>(null);
const constructorField = useTemplateRef('field');

const currentTargetBlock = computed(() => {
  return currentTarget.value ? recursiveFind(htmlItems.value, currentTarget.value) : null;
})

// TODO доработать систему id
const addBlock = () => {
  const target = currentTargetBlock.value;
  const newBaseBlock = JSON.parse(JSON.stringify(baseBlock));
  if (currentTarget.value && target) {
    if ("children" in target) {
      target.children.push({...newBaseBlock, id: getTargetId(target)});
    }
  } else {
    htmlItems.value.push({...newBaseBlock, id: htmlItems.value.length.toString()});
  }
}

async function saveFile() {
  try {
    await $api.fileManager.saveFile({
      content: htmlItems.value
    })
  } catch (error) {
    console.error('Error:', error);
  }
}

async function downloadFile() {
  if (constructorField.value?.field) {
    try {
      // TODO рендерить на сервере, чтобы cносить style атрибуты
      const res = await $api.fileManager.downloadFile({
        content: constructorField.value.field.outerHTML,
      })
      window.open(res.downloadUrl);
      await saveFile();
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
</script>

<template>
  <div class="h-full w-fit mx-auto p-[10px]">
    <div class="border-[#FF0000]  bg-[black]"></div>
    <ConstructorField
      ref="field"
      :nodes="htmlItems"
      @select-target="currentTarget = $event"
    />
    <ConstructorToolbarFile
      class="absolute top-4 left-4 h-fit"
      @add-block="addBlock"
      @save-file="saveFile"
      @download-file="downloadFile"
    />
    <ConstructorToolbarBlock
      v-if="currentTargetBlock"
      :current-target="currentTargetBlock"
      class="absolute top-4 right-4 h-fit"
    />
  </div>
</template>

<style scoped lang="scss">

</style>