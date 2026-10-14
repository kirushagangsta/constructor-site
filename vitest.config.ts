import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath} from 'node:url';

/**
 * Тесты поднимаются без Nuxt: берём только Vite + плагин Vue.
 * Алиас '~' повторяет nuxt-овский, чтобы импорты в тестах выглядели как в коде.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
