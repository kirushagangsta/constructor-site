<script setup lang="ts">
import type {IHistoryEntry} from "~/composables/usePageHistory";

defineProps({
  /** Журнал: самое свежее действие первым */
  entries: {
    type: Array as PropType<IHistoryEntry[]>,
    default: () => []
  },
  /** Самые старые шаги уже забыты — дальше них отмена не вернёт */
  trimmed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  /** Без номера отменяется последнее действие, с номером — ещё и всё, что после */
  undo: [entryId?: number];
}>()
</script>

<template>
  <UiFloatingPanel
    title="Что делали"
    icon="🕰️"
    :width="260"
    :top="404"
    :left="272"
    storage-key="constructor:toolbar-history"
  >
    <div class="flex flex-col gap-[10px]">
      <UiButton
        variant="soft"
        icon="↩️"
        title="Отменить последнее действие (ctrl+z)"
        :disabled="!entries.length"
        @click="emit('undo')"
      >
        Отменить
      </UiButton>

      <p
        v-if="!entries.length"
        class="text-[13px] text-center text-ink-muted"
      >
        Пока ничего не меняли
      </p>

      <div
        v-else
        class="flex flex-col gap-[6px]"
      >
        <button
          v-for="entry in entries"
          :key="entry.id"
          type="button"
          class="ui-log-entry"
          title="Вернуть страницу к тому, что было до этого действия"
          @click="emit('undo', entry.id)"
        >
          <code class="ui-hint shrink-0">{{ entry.time }}</code>
          <span class="flex-1 min-w-0 text-left">{{ entry.title }}</span>
          <span class="shrink-0 text-primary">↩</span>
        </button>
      </div>

      <p
        v-if="trimmed"
        class="text-[12px] leading-snug text-center text-primary-strong"
      >
        Что было раньше этого, редактор уже не помнит
      </p>

      <p
        v-if="entries.length"
        class="text-[12px] leading-snug text-ink-muted"
      >
        Клик по действию вернёт страницу к тому, что было до него — вместе со всем, что случилось позже
      </p>
    </div>
  </UiFloatingPanel>
</template>

<style scoped lang="scss">

</style>
