<script setup lang="ts">
import type {IHtmlNode} from "~/types/constructor";
import {extractClasses, getClassByProperty} from "@/utils/cssClasses/extractor";
import type {CssPropertyName, FormattedClassData, ICssClassData} from "~/types/cssClasses";
import {cssProperties} from "~/constants/tailwindClasses";

const props = defineProps({
  currentTarget: {
    type: Object as PropType<IHtmlNode>,
    required: true
  }
})

const extractedClasses = ref<ICssClassData[]>([]);
const extractedClassesValues = ref<FormattedClassData>({} as FormattedClassData);

const extractTargetClasses = () => {
  if (props.currentTarget.attrs.class) {
    extractedClasses.value = extractClasses(props.currentTarget.attrs.class);
    extractedClassesValues.value = Object.assign({}, ...extractedClasses.value.map(el => ({
      [el.cssProperty]: {
        value: el.classValue,
        ...(el.measureUnit ? {measureUnit: el?.measureUnit} : {})
      }
    })))
  }
}

extractTargetClasses();

const updateStyles = (propertyName: CssPropertyName) => {
  const propertyVal = extractedClassesValues.value[propertyName];
  const currentPropertyDeclaration = cssProperties.find(el => el.name === propertyName);
  const computedVal = propertyVal.value === '' ?
    currentPropertyDeclaration!.defaultValue :
    propertyVal.value;
  const valueWithUnit = computedVal + (propertyVal.measureUnit ?? '');
  if (!props.currentTarget.attrs.style) {
    props.currentTarget.attrs.style = {
      [propertyName]: valueWithUnit,
    }
  } else {
    props.currentTarget.attrs.style[propertyName] = valueWithUnit;
  }
  const existingTailwindClass = getClassByProperty(props.currentTarget.attrs.class ?? "", propertyName);
  const newTailwindClass = currentPropertyDeclaration!.tailwindClassPrefix + "-[" + valueWithUnit + "]";
  if (existingTailwindClass) {
    props.currentTarget.attrs.class = props.currentTarget.attrs.class?.replace(existingTailwindClass, newTailwindClass) ?? newTailwindClass;
  } else {
    if (props.currentTarget.attrs.class) {
      props.currentTarget.attrs.class += ` ${newTailwindClass}`;
    } else props.currentTarget.attrs.class = newTailwindClass;
  }
}

watch(() => props.currentTarget, () => {
  extractTargetClasses();
})
</script>

<template>
  <div class="">
    <div class="flex flex-col gap-[16px]">
      <div class="flex gap-[16px]">
        <div>Внутренний отступ</div>
        <input
          v-model="extractedClassesValues['padding'].value"
          @input="updateStyles('padding')"
        >
        <input
          v-model="extractedClassesValues['padding'].measureUnit"
          disabled
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>