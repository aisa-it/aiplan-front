<template>
  <q-page>
    <router-view v-slot="{ Component, route }">
      <transition
        appear
        name="fade"
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </q-page>
</template>

<script setup lang="ts">
//core
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { watch } from 'vue';

import { useSingleIssueStore } from 'src/stores/single-issue-store';

//core
const route = useRoute();

//stores
const singleIssueStore = useSingleIssueStore();


const { issueData, currentIssueID } = storeToRefs(singleIssueStore);

watch(
  () => route.params.issue,
  () => {
    if (!route.params.issue) {
      issueData.value = null;
      currentIssueID.value = '';
    }
  },
  { immediate: true },
);
</script>
