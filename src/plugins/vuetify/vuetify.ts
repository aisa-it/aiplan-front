import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { md3 } from 'vuetify/blueprints';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { useI18n } from 'vue-i18n';

import { i18n } from '@/i18n';

const vuetify = createVuetify({
  blueprint: md3,
  locale: {
    adapter: createVueI18nAdapter({
      i18n: i18n as unknown as Parameters<
        typeof createVueI18nAdapter
      >[0]['i18n'],
      useI18n,
    }),
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3f75ff',
          'issue-dialog-action': '#3f75ff',
          'on-issue-dialog-action': '#ffffff',
          secondary: '#5CBBF6',
          accent: '#AA3BFF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#fff',
          border: '#dde2ea',
          text: '#474a52',
          icon: '#474a52',
          surface: '#ffffff',
          // Компоненты Vuetify (v-card, v-btn, v-data-table, v-app-bar и др.)
          // красят текст через on-*, а не через text; без явного значения
          // Vuetify генерирует on-* как чистый чёрный/белый.
          'on-background': '#474a52',
          'on-surface': '#474a52',
          'on-surface-variant': '#474a52',
        },
        variables: {
          'hover-opacity': 0.08,
          'issue-dialog-shadow':
            '0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)',
        },
      },
      dark: {
        colors: {
          primary: '#6C8CFF',
          'issue-dialog-action': '#5685fb',
          'on-issue-dialog-action': '#ffffff',
          secondary: '#80D0FF',
          accent: '#C084FC',
          error: '#FF5252',
          info: '#64B5F6',
          success: '#81C784',
          warning: '#FFD54F',
          background: '#1f2228',
          surface: '#1f2228',
          border: '#31363f',
          text: '#bac4d5',
          icon: '#bac4d5',
          // См. комментарий в светлой теме: on-* задают цвет текста компонентов Vuetify
          'on-background': '#bac4d5',
          'on-surface': '#bac4d5',
          'on-surface-variant': '#bac4d5',
        },
        variables: {
          'issue-dialog-shadow':
            '0 1px 5px rgba(255, 255, 255, 0.2), 0 2px 2px rgba(255, 255, 255, 0.14), 0 3px 1px -2px rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
  defaults: {
    VCard: { elevation: 1 },
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VTextField: {
      color: 'primary',
      variant: 'underlined',
    },
    VSelect: { color: 'primary', variant: 'underlined' },
    VTextarea: {
      color: 'primary',
      variant: 'underlined',
    },
    VAutocomplete: {
      color: 'primary',
      variant: 'underlined',
    },
    VDialog: {
      VCardText: {
        class: 'px-4 py-2 pt-4',
      },
      VCardTitle: {
        class: 'px-4 pt-4 pb-2',
      },
      VCardActions: {
        class: 'px-4 pb-4 pt-2',
      },
    },
  },
});

export default vuetify;
