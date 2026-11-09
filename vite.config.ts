import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

import { i18nDictionariesPlugin } from './scripts/i18n-dictionaries.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
      // Сообщения в .ts компилируются в рантайме — компилятор нужен.
      __INTLIFY_DROP_MESSAGE_COMPILER__: false,
    },
    plugins: [
      i18nDictionariesPlugin(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith('altcha-'),
          },
        },
      }),
      vuetify({
        autoImport: true,
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        src: fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
