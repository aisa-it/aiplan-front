<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <ResetPasswordPage />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';

import ResetPasswordPage from 'src/pages/ResetPasswordPage.vue';

export default defineComponent({
  name: 'ResetPasswordLayout',
  components: {
    ResetPasswordPage,
  },
  setup() {
    useMeta({
      title: 'АИПлан | Инструмент управления проектами.',
    });
    return {};
  },
});
</script>
