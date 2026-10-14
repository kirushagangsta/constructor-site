import * as vue from 'vue';

/**
 * Тесты идут без Nuxt, а он в обычной сборке сам подставляет ref, watch и прочее.
 * Поэтому кладём эти функции в глобальные — ровно то, что делает авто-импорт,
 * только руками. Без этого компоненты, написанные в стиле Nuxt, не запустятся.
 */
const autoImports = [
  'ref', 'computed', 'reactive', 'watch', 'watchEffect',
  'onMounted', 'onBeforeUnmount', 'onUnmounted', 'nextTick',
  'useTemplateRef', 'shallowRef', 'toRef', 'toRefs', 'provide', 'inject',
] as const;

for (const name of autoImports) {
  const api = (vue as Record<string, unknown>)[name];

  if (api && !(name in globalThis)) {
    (globalThis as Record<string, unknown>)[name] = api;
  }
}
