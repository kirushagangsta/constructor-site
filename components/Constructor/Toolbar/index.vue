<script setup lang="ts">
const emit = defineEmits(['add-block'])
</script>

<template>
  <div>
    <button @click="emit('add-block')">addBlock</button>
  </div>
</template>

<style scoped lang="scss">

</style>