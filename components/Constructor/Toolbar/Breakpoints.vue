<script setup lang="ts">
import type {IHtmlNode, StyleVariant} from "~/types/constructor";
import {breakpoints} from "~/constants/constructor/breakpoints";

const variant = defineModel({
  type: String as PropType<StyleVariant>,
  default: 'base'
});

const props = defineProps({
  /** Выбранный блок: показываем, на каких точках у него есть свои правки */
  currentTarget: {
    type: Object as PropType<IHtmlNode>,
    required: true
  }
});

/** Есть ли у блока собственные стили на этой контрольной точке */
const hasOwnStyles = (name: StyleVariant) => {
  return Object.keys(props.currentTarget.styles[name] ?? {}).length > 0;
}
</script>

<template>
  <UiFloatingPanel
    title="Ширина экрана"
    icon="📱"
    :width="240"
    :top="404"
    :left="16"
    storage-key="constructor:toolbar-breakpoints"
  >
    <div class="flex flex-col gap-[8px]">
      <button
        v-for="breakpoint in breakpoints"
        :key="breakpoint.name"
        type="button"
        class="ui-chip justify-between w-full"
        :class="{'ui-chip--active': variant === breakpoint.name}"
        :aria-pressed="variant === breakpoint.name"
        @click="variant = breakpoint.name"
      >
        <span class="flex items-center gap-[6px]">
          <!-- точка значит, что на этой ширине у блока есть свои правки -->
          <span
            class="w-[6px] h-[6px] rounded-pill"
            :class="hasOwnStyles(breakpoint.name) ? 'bg-accent' : 'bg-border'"
          />
          {{ breakpoint.title }}
        </span>
        <code class="ui-hint">
          {{ breakpoint.minWidth ? `${breakpoint.name} ≥ ${breakpoint.minWidth}` : 'от 0' }}
        </code>
      </button>

      <p class="text-[12px] leading-snug text-ink-muted">
        Правки работают от выбранной ширины и шире. Самая узкая — общие стили страницы.
      </p>
    </div>
  </UiFloatingPanel>
</template>

<style scoped lang="scss">

</style>
