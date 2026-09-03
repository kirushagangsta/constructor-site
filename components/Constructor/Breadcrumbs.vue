<script setup lang="ts">
import type {IHtmlNode} from "~/types/constructor";
import {getBlockNumber} from "~/utils/constructor/getId";

defineProps({
  /** Путь от самого главного блока до выбранного */
  path: {
    type: Array as PropType<IHtmlNode[]>,
    required: true
  }
});

const emit = defineEmits(['select-target']);

const getBlockTitle = (node: IHtmlNode) => `Блок ${getBlockNumber(node.id)}`;
</script>

<template>
  <nav class="flex flex-wrap items-center gap-[6px] px-[14px] py-[8px] bg-surface border-2 border-border rounded-pill shadow-soft">
    <button
      type="button"
      class="ui-chip"
      :class="{'ui-chip--active': !path.length}"
      @click="emit('select-target', null)"
    >
      🌸 Вся страница
    </button>

    <template
      v-for="(node, index) in path"
      :key="node.id"
    >
      <span class="text-ink-muted">›</span>
      <button
        type="button"
        class="ui-chip"
        :class="{'ui-chip--active': index === path.length - 1}"
        :title="index === 0 ? 'Самый главный блок' : 'Блок уровня ' + (index + 1)"
        @click="emit('select-target', node.id)"
      >
        {{ getBlockTitle(node) }}
        <code class="ui-hint">{{ node.tag }}</code>
      </button>
    </template>

    <span
      v-if="!path.length"
      class="ui-label"
    >
      кликните по блоку на холсте
    </span>
  </nav>
</template>

<style scoped lang="scss">

</style>
