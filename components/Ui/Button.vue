<script setup lang="ts">
type ButtonVariant = 'primary' | 'soft';

defineProps({
  variant: {
    type: String as PropType<ButtonVariant>,
    default: 'primary'
  },
  /** Эмодзи-иконка слева от текста */
  icon: {
    type: String,
    default: ''
  }
});

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-surface border-primary hover:bg-primary-strong hover:border-primary-strong',
  soft: 'bg-surface-muted text-primary-strong border-border hover:bg-primary-soft hover:border-primary'
};
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center gap-[8px] w-full px-[18px] py-[9px] text-[15px] font-bold
    border-2 rounded-pill shadow-soft transition-all duration-200 hover:-translate-y-[1px] hover:shadow-pop
    active:translate-y-0"
    :class="variantClasses[variant]"
  >
    <span v-if="icon">{{ icon }}</span>
    <slot />
  </button>
</template>

<style scoped lang="scss">

</style>
