<template>
  <ConferenceEntry />
</template>

<script setup>
import { storeToRefs } from 'pinia';
import ConferenceEntry from 'src/modules/conference/ConferenceEntry.vue';
import { useUtilsStore } from 'src/stores/utils-store';
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

const utilsStore = useUtilsStore();
const { isEnabledJitsi } = storeToRefs(utilsStore);

const router = useRouter();

onBeforeMount(async () => {
  await utilsStore.getVersion();

  if (isEnabledJitsi.value === true) return router.push('/');
});
</script>
