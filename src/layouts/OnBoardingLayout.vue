<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <OnBoardingPage />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
import { useMeta } from 'quasar';
import OnBoardingPage from 'src/pages/OnBoardingPage.vue';
import { useQuasar } from 'quasar';
import { stopGlobalLoading } from 'src/composables/useGlobalLoader';
const api = useAiplanStore();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { auth } = storeToRefs(api);
const $q = useQuasar();

const setTheme = () => {
  if (user.value?.theme) {
    localStorage.setItem('dark', String(userStore.getTheme === 'dark'));
    $q.dark.set(userStore.getTheme === 'dark');
  } else $q.dark.set(JSON.parse(localStorage.getItem('dark') ?? 'false'));
};

watch(
  () => auth.value,
  () => {
    setTheme();
  },
  {
    deep: true,
  },
);
watch(
  () => user.value,
  () => {
    setTheme();
  },
  {
    deep: true,
  },
);

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
