<script setup lang="ts">
import type {IPathStep} from "~/utils/constructor/getNodesPath";
import {getBlockNumber} from "~/utils/constructor/getNodesPath";

defineProps({
  /** Путь от самого главного блока до выбранного */
  path: {
    type: Array as PropType<IPathStep[]>,
    required: true
  }
});

const emit = defineEmits(['select-target']);

/** Номер блока — его место в дереве, поэтому считается по пути до него */
const getBlockTitle = (path: IPathStep[], depth: number) => `Блок ${getBlockNumber(path.slice(0, depth + 1))}`;
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
      v-for="(step, index) in path"
      :key="step.node.id"
    >
      <span class="text-ink-muted">›</span>
      <button
        type="button"
        class="ui-chip"
        :class="{'ui-chip--active': index === path.length - 1}"
        :title="index === 0 ? 'Самый главный блок' : 'Блок уровня ' + (index + 1)"
        @click="emit('select-target', step.node.id)"
      >
        {{ getBlockTitle(path, index) }}
        <code class="ui-hint">{{ step.node.tag }}</code>
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
