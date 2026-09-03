<script setup lang="ts">
defineProps({
  /** Что случилось с файлом в последний раз — сохранили, скачали, импортировали */
  message: {
    type: String,
    default: ''
  },
  failed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['add-block', 'preview-page', 'save-file', 'download-file', 'open-import'])
</script>

<template>
  <UiFloatingPanel
    title="Конструктор"
    icon="🎀"
    :width="240"
    :top="16"
    :left="16"
    storage-key="constructor:toolbar-file"
  >
    <div class="flex flex-col gap-[10px]">
      <UiButton
        icon="✨"
        @click="emit('add-block')"
      >
        Добавить блок
      </UiButton>
      <UiButton
        variant="soft"
        icon="👀"
        title="Посмотреть страницу без редактора"
        @click="emit('preview-page')"
      >
        Превью
      </UiButton>
      <UiButton
        variant="soft"
        icon="💾"
        @click="emit('save-file')"
      >
        Сохранить
      </UiButton>
      <UiButton
        variant="soft"
        icon="🎁"
        @click="emit('download-file')"
      >
        Скачать
      </UiButton>
      <UiButton
        variant="soft"
        icon="📥"
        title="Собрать страницу из json"
        @click="emit('open-import')"
      >
        Импорт json
      </UiButton>

      <p
        v-if="message"
        class="text-[13px] font-semibold text-center"
        :class="failed ? 'text-primary-strong' : 'text-ink-muted'"
      >
        {{ message }}
      </p>
    </div>
  </UiFloatingPanel>
</template>

<style scoped lang="scss">

</style>
