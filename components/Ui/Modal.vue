<script setup lang="ts">
/** Нативный dialog: Esc и фокус внутри окна работают сами */
const isOpen = defineModel({type: Boolean, default: false});

defineProps({
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
    default: 560
  }
});

const dialog = useTemplateRef<HTMLDialogElement>('dialog');

watch(isOpen, (opened) => {
  if (opened) {
    dialog.value?.showModal();
  } else {
    dialog.value?.close();
  }
});
</script>

<template>
  <!-- клик по подложке приходит на сам dialog, поэтому закрываем по .self -->
  <dialog
    ref="dialog"
    class="ui-modal"
    :style="{width: `${width}px`}"
    @close="isOpen = false"
    @click.self="isOpen = false"
  >
    <header class="ui-modal__header">
      <span v-if="icon">{{ icon }}</span>
      <h2 class="ui-panel__title">{{ title }}</h2>
      <button
        type="button"
        class="ui-panel__reset"
        title="Закрыть"
        aria-label="Закрыть"
        @click="isOpen = false"
      >
        ✕
      </button>
    </header>

    <div class="flex flex-col gap-[12px] min-h-0 overflow-y-auto px-[20px] py-[16px]">
      <slot />
    </div>
  </dialog>
</template>

<style scoped lang="scss">

</style>
