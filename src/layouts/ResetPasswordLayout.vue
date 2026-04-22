<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <ResetPasswordPage />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useMeta } from 'quasar';

import ResetPasswordPage from 'src/pages/ResetPasswordPage.vue';

useMeta({
  title: 'АИПлан | Инструмент управления проектами.',
});
</script>
