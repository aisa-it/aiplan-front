import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md3 } from 'vuetify/blueprints'

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3f75ff',
          secondary: '#5CBBF6',
          accent: '#AA3BFF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          border: '#dde2ea',
          text: '#474a52',
          icon: '#474a52',
        },
      },
      dark: {
        colors: {
          primary: '#6C8CFF',
          secondary: '#80D0FF',
          accent: '#C084FC',
          error: '#FF5252',
          info: '#64B5F6',
          success: '#81C784',
          warning: '#FFD54F',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VCard: { elevation: 1 },
  },
})

export default vuetify
