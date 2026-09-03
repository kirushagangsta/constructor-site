<script setup lang="ts">
import type {BlockKind} from "~/constants/constructor/baseBlock";

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

const emit = defineEmits<{
  /** Какой блок добавить — обычный или картинку */
  'add-block': [kind: BlockKind];
  'preview-page': [];
  'save-file': [];
  'download-file': [];
  'open-import': [];
}>()
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
        @click="emit('add-block', 'block')"
      >
        Добавить блок
      </UiButton>
      <UiButton
        icon="🖼️"
        title="Картинку можно будет выбрать в панели блока"
        @click="emit('add-block', 'image')"
      >
        Добавить картинку
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
        title="zip со страницей и её картинками"
        @click="emit('download-file')"
      >
        Скачать архив
      </UiButton>
      <UiButton
        variant="soft"
        icon="📥"
        title="Собрать страницу из json"
        @click="emit('open-import')"
      >
        Импорт json
      </UiButton>

      <!--
        Страницу грузят и сохраняют только в браузере, поэтому и сообщение об этом
        браузерное: на сервере его ещё нет, и без ClientOnly разметка расходилась бы при гидрации
      -->
      <ClientOnly>
        <p
          v-if="message"
          class="text-[13px] font-semibold text-center"
          :class="failed ? 'text-primary-strong' : 'text-ink-muted'"
        >
          {{ message }}
        </p>
      </ClientOnly>
    </div>
  </UiFloatingPanel>
</template>

<style scoped lang="scss">

</style>
