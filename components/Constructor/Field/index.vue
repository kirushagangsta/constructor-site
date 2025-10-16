<script setup lang="ts">
import type {IHtmlNode} from "~/types/constructor";

const props = defineProps({
  nodes: {
    type: Array as PropType<IHtmlNode[]>,
    required: true
  }
});

const field = useTemplateRef('field');

const emit = defineEmits(['select-target']);

const createVNode = (item: IHtmlNode): VNode => {
  return h(
    item.tag,
    {
      ...item.attrs,
      'data-id': item.id,
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        emit('select-target', item.id);
      },
    },
    [
      ...item.children.map((el: IHtmlNode | string) => {
        return typeof el === 'string' ? el : createVNode(el);
      }).filter((el) => !!el),
    ]
  );
};

defineExpose({
  field
})
</script>

<template>
  <div class="w-[1140px] h-full border border-[#000000]">
    <div
      ref="field"
    >
      <component
        v-for="node in nodes"
        :key="node.id"
        :is="createVNode(node)"
        @click.stop="emit('select-target', node.id)"
      >
      </component>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>