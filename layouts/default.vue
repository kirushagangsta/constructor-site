<script setup lang="ts">
</script>

<template>
  <div class="relative w-full h-full bg-bg overflow-hidden">
    <!-- Декоративные размытые пятна фона -->
    <div class="pointer-events-none absolute -top-[120px] -left-[120px] w-[340px] h-[340px] rounded-pill bg-primary-soft blur-[90px] opacity-80"></div>
    <div class="pointer-events-none absolute -bottom-[140px] -right-[120px] w-[380px] h-[380px] rounded-pill bg-accent-soft blur-[90px] opacity-80"></div>

    <div class="relative z-10 h-full">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>