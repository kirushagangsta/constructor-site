<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  /** Эмодзи-иконка в шапке */
  icon: {
    type: String,
    default: ''
  },
  width: {
    type: Number,
    default: 320
  },
  top: {
    type: Number,
    default: 16
  },
  /** Панель прижимается либо к левому краю, либо к правому — до первого перетаскивания */
  left: {
    type: Number as PropType<Nullable<number>>,
    default: null
  },
  right: {
    type: Number as PropType<Nullable<number>>,
    default: null
  },
  /** Под этим ключом положение и размер панели запоминаются между заходами */
  storageKey: {
    type: String,
    required: true
  }
});

const panel = useTemplateRef('panel');

const {panelStyle, isDragging, startDrag, startResize, resetPanelState} = useFloatingPanel(panel, {
  top: props.top,
  left: props.left,
  right: props.right,
  width: props.width,
  storageKey: props.storageKey
});
</script>

<template>
  <section
    ref="panel"
    class="ui-panel fixed z-50 flex flex-col p-0"
    :style="panelStyle"
  >
    <header
      class="ui-panel__drag"
      :class="{'ui-panel__drag--active': isDragging}"
      title="Потяните, чтобы передвинуть"
      @pointerdown.prevent="startDrag"
    >
      <span v-if="icon">{{ icon }}</span>
      <h2 class="ui-panel__title">{{ title }}</h2>
      <button
        type="button"
        class="ui-panel__reset"
        title="Вернуть панель на место"
        aria-label="Вернуть панель на место"
        @pointerdown.stop
        @click="resetPanelState"
      >
        ↺
      </button>
      <span class="ui-panel__grip">⠿</span>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto px-[20px] py-[16px]">
      <slot />
    </div>

    <button
      type="button"
      class="ui-resize-handle"
      aria-label="Изменить размер панели"
      title="Потяните, чтобы изменить размер"
      @pointerdown.prevent="startResize"
    />
  </section>
</template>

<style scoped lang="scss">

</style>
