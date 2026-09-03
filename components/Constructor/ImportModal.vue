<script setup lang="ts">
const isOpen = defineModel({type: Boolean, default: false});

defineProps({
  /** Текст ошибки разбора: окно остаётся открытым, чтобы json можно было поправить */
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['import']);

const json = ref('');

/** Каждый заход начинается с чистого поля */
watch(isOpen, (opened) => {
  if (opened) {
    json.value = '';
  }
});
</script>

<template>
  <UiModal
    v-model="isOpen"
    title="Импорт json"
    icon="📥"
  >
    <p class="ui-label">
      Вставьте json, которым описывается сайт
      <code class="ui-hint">id · tag · attrs · children</code>
    </p>

    <textarea
      v-model="json"
      class="ui-textarea h-[320px] font-mono text-[13px]"
      spellcheck="false"
      placeholder='[{"id": "page", "tag": "div", "attrs": {}, "children": []}]'
    />

    <p
      v-if="error"
      class="text-[13px] font-semibold text-primary-strong"
    >
      {{ error }}
    </p>

    <div class="flex gap-[10px]">
      <UiButton
        variant="soft"
        @click="isOpen = false"
      >
        Отмена
      </UiButton>
      <UiButton
        icon="📥"
        @click="emit('import', json)"
      >
        Импортировать
      </UiButton>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">

</style>
