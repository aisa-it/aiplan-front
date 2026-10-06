<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <OnBoardingPage />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { useMeta } from 'quasar';
import OnBoardingPage from 'src/pages/OnBoardingPage.vue';
import { stopGlobalLoading } from 'src/composables/useGlobalLoader';
const userStore = useUserStore();

onMounted(async () => {
  await userStore
    .getUserInfo()
    .then(() => stopGlobalLoading())
    .finally(() => stopGlobalLoading());
});

useMeta({
  title: 'АИПлан | Инструмент управления проектами.',
});
</script>
