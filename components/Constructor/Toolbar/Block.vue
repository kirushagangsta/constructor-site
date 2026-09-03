<script setup lang="ts">
import type {IHtmlNode, StyleVariant} from "~/types/constructor";
import {extractPropertyValues} from "@/utils/cssClasses/extractor";
import type {FormattedClassData, ICssOption, ICssProperty} from "~/types/cssClasses";
import {cssMeasureUnits, cssPropertyGroups} from "~/constants/cssProperties";
import {PAGE_ID} from "~/utils/constructor/page";
import {getVariantDeclarations} from "~/utils/constructor/pageCss";
import {getBreakpoint} from "~/constants/constructor/breakpoints";
import {getNodeText, setNodeText} from "~/utils/constructor/text";

const props = defineProps({
  currentTarget: {
    type: Object as PropType<IHtmlNode>,
    required: true
  },
  /** Какую контрольную точку сейчас правим */
  variant: {
    type: String as PropType<StyleVariant>,
    default: 'base'
  }
})

/** Страницу редактируем той же панелью, что и блоки — меняется только заголовок */
const isPage = computed(() => props.currentTarget.id === PAGE_ID);
const panelTitle = computed(() => isPage.value ? 'Как выглядит страница' : 'Как выглядит блок');

const breakpoint = computed(() => getBreakpoint(props.variant));

/** Текст блока правится и здесь, и двойным кликом прямо на холсте */
const text = computed({
  get: () => getNodeText(props.currentTarget),
  set: (value: string) => setNodeText(props.currentTarget, value)
})

/** Значения css-свойств выбранного блока, разобранные из его стилей */
const propertyValues = ref<FormattedClassData>({} as FormattedClassData);

const extractTargetStyles = () => {
  const extracted = extractPropertyValues(getVariantDeclarations(props.currentTarget, props.variant));
  propertyValues.value = Object.fromEntries(
    extracted.map((item) => [
      item.cssProperty,
      {
        value: item.classValue,
        ...(item.measureUnit ? {measureUnit: item.measureUnit} : {}),
      },
    ])
  );
}

/** Введённое значение свойства, а если поле пустое — значение по умолчанию */
const getEffectiveValue = (property: ICssProperty) => {
  const {value} = propertyValues.value[property.name];
  return value === '' ? property.defaultValue : value;
}

/** Выбранное значение-слово (auto, fit-content...), если оно сейчас включено */
const getActiveKeyword = (property: ICssProperty) => {
  return property.keywords?.find((keyword) => keyword.value === getEffectiveValue(property));
}

/** Число показываем только когда не выбрано значение-слово */
const getNumberValue = (property: ICssProperty) => {
  return getActiveKeyword(property) ? '' : propertyValues.value[property.name].value;
}

/** Значение свойства для css: значение-слово либо число с единицей измерения */
const getCssPropValue = (property: ICssProperty) => {
  const value = getEffectiveValue(property);

  if (!value || getActiveKeyword(property) || property.control !== 'length') {
    return value.trim();
  }

  const unit = propertyValues.value[property.name].measureUnit ?? property.defaultUnit ?? '';
  return `${value}${unit}`.replace(/\s+/g, '');
}

/**
 * Стили блока — обычные данные: из них собирается css страницы.
 * Пишем ровно в выбранную контрольную точку, поэтому на ней пустое поле не
 * обнуляет свойство, а снимает правку — снова начинает действовать общее значение.
 */
const updateStyles = (property: ICssProperty) => {
  const value = getCssPropValue(property);
  const declarations = {...props.currentTarget.styles[props.variant]};

  if (value) {
    declarations[property.name] = value;
  } else {
    delete declarations[property.name];
  }

  props.currentTarget.styles = {...props.currentTarget.styles, [props.variant]: declarations};

  if (props.variant !== 'base') {
    // поле должно показать значение, которое пришло с меньших экранов
    extractTargetStyles();
  }
}

const setValue = (property: ICssProperty, value: string) => {
  propertyValues.value[property.name].value = value;
  updateStyles(property);
}

/** Повторное нажатие на включённое слово возвращает поле к числу */
const toggleKeyword = (property: ICssProperty, keyword: ICssOption) => {
  setValue(property, getActiveKeyword(property)?.value === keyword.value ? '' : keyword.value);
}

extractTargetStyles();

watch([() => props.currentTarget, () => props.variant], extractTargetStyles)
</script>

<template>
  <UiFloatingPanel
    :title="panelTitle"
    icon="💖"
    :width="340"
    :top="16"
    :right="16"
    storage-key="constructor:toolbar-block"
  >
    <div class="flex flex-col gap-[10px]">
      <p
        v-if="variant !== 'base'"
        class="text-[12px] leading-snug text-primary-strong"
      >
        Правите вид от {{ breakpoint.minWidth }}px и шире
        <code class="ui-hint">{{ variant }}</code>
      </p>

      <details
        v-if="!isPage"
        open
        class="ui-group"
      >
        <summary class="ui-group__title">
          <span>✏️</span>
          Текст
        </summary>

        <div class="flex flex-col gap-[6px] pt-[12px]">
          <span class="ui-label">Что написано в блоке</span>
          <textarea
            v-model="text"
            class="ui-textarea"
            rows="3"
            placeholder="пусто"
            aria-label="Текст блока"
          />
          <span class="text-[12px] text-ink-muted">Ещё текст можно править двойным кликом по блоку на холсте</span>
        </div>
      </details>

      <details
        v-for="(group, groupIndex) in cssPropertyGroups"
        :key="group.name"
        :open="groupIndex === 0"
        class="ui-group"
      >
        <summary class="ui-group__title">
          <span>{{ group.icon }}</span>
          {{ group.title }}
        </summary>

        <div class="flex flex-col gap-[14px] pt-[12px]">
          <div
            v-for="property in group.properties"
            :key="property.name"
            class="flex flex-col gap-[6px]"
          >
            <span class="ui-label">
              {{ property.label }}
              <code class="ui-hint">{{ property.name }}</code>
            </span>

            <div class="flex items-center gap-[8px]">
              <select
                v-if="property.control === 'keyword'"
                v-model="propertyValues[property.name].value"
                class="ui-input"
                :aria-label="property.label"
                @change="updateStyles(property)"
              >
                <option value="">не задано</option>
                <option
                  v-for="option in property.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }} ({{ option.value }})
                </option>
              </select>

              <template v-else>
                <input
                  v-if="property.control === 'color'"
                  type="color"
                  class="ui-color"
                  :value="propertyValues[property.name].value || '#ffffff'"
                  :aria-label="`${property.label}: палитра`"
                  @input="setValue(property, ($event.target as HTMLInputElement).value)"
                >
                <input
                  class="ui-input"
                  :value="getNumberValue(property)"
                  :disabled="!!getActiveKeyword(property)"
                  :placeholder="getActiveKeyword(property)?.label ?? (property.defaultValue || 'не задано')"
                  :aria-label="property.label"
                  @input="setValue(property, ($event.target as HTMLInputElement).value)"
                >
                <select
                  v-if="property.control === 'length'"
                  v-model="propertyValues[property.name].measureUnit"
                  class="ui-input w-[76px]"
                  :disabled="!!getActiveKeyword(property)"
                  :aria-label="`${property.label}: единица измерения`"
                  @change="updateStyles(property)"
                >
                  <option value="">—</option>
                  <option
                    v-for="unit in cssMeasureUnits"
                    :key="unit"
                    :value="unit"
                  >
                    {{ unit }}
                  </option>
                </select>
              </template>
            </div>

            <div
              v-if="property.keywords"
              class="flex flex-wrap gap-[6px]"
            >
              <button
                v-for="keyword in property.keywords"
                :key="keyword.value"
                type="button"
                class="ui-chip"
                :class="{'ui-chip--active': getActiveKeyword(property)?.value === keyword.value}"
                :aria-pressed="getActiveKeyword(property)?.value === keyword.value"
                @click="toggleKeyword(property, keyword)"
              >
                {{ keyword.label }}
                <code class="ui-hint">{{ keyword.value }}</code>
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  </UiFloatingPanel>
</template>

<style scoped lang="scss">

</style>
