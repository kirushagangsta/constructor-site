<script setup lang="ts">
import type {IHtmlNode} from "~/types/constructor";
import {baseBlock} from "~/constants/constructor/baseBlock";
import {recursiveFind} from "~/utils/constructor/recursiveFind";
import {getTargetId} from "~/utils/constructor/getId";

const htmlItems = ref<IHtmlNode[]>([
  {
    id: "0",
    tag: 'div',
    attrs: { class: 'p-[10px] border border-[brown]' },
    children: [
      'hello'
    ],
  },
])

const currentTarget = ref<Nullable<string>>(null);

const addBlock = () => {
  // TODO пофиксить хуйню с дохуя блоков при добавлении
  const target = currentTarget.value ? recursiveFind(htmlItems.value, currentTarget.value) : htmlItems.value;
  if (currentTarget.value && target) {
    if ("children" in target) {
      const newBaseBlock = JSON.parse(JSON.stringify(baseBlock));
      target.children.push({...newBaseBlock, id: getTargetId(target)});
    }
  } else {
    htmlItems.value.push({...baseBlock, id: htmlItems.value.length.toString()});
  }
}
</script>

<template>
  <div class="h-full w-fit mx-auto pl-[10px]">
    <div class="border-[#FF0000]  bg-[black]"></div>
    <ConstructorField
      :nodes="htmlItems"
      @select-target="currentTarget = $event"
    />
    <ConstructorToolbar
      class="absolute top-4 right-4 h-fit"
      @add-block="addBlock"
    />
  </div>
</template>

<style scoped lang="scss">

</style>