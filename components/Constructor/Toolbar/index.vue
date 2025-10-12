<script setup lang="ts">
const emit = defineEmits(['add-block', 'save-file', 'download-file'])
</script>

<template>
  <div class="flex flex-col">
    <div @click="emit('add-block')">addBlock</div>
    <div @click="emit('save-file')">Save file</div>
    <div @click="emit('download-file')">Download file</div>
  </div>
</template>

<style scoped lang="scss">

</style>