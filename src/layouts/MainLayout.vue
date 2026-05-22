<template>
  <q-layout
    v-show="$q.loading.isActive === false"
    view="hHh Lpr lff"
    style="max-height: 100%; max-width: 100%"
  >
    <LightsNewYear v-if="utilsStore.ny === true" />
    <SnowFall v-if="utilsStore.ny === true && isSnowEnable" />
    <div>
      <MainHeader @toggle="toggleLeftDrawer()" />
      <PrimaryLoader v-show="generalLoader === true" />

      <!-- <MainLayoutDrawer v-model:drawer-open="leftDrawerOpen" /> -->
      <NavBar />

      <q-page-container>
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
      </q-page-container>
    </div>

    <ReleaseNotePreviewDialog v-model="isShowReleaseNote" />
  </q-layout>
</template>

<script setup lang="ts">
// core
import { useQuasar, useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { ref, computed, onUnmounted, onBeforeMount, shallowRef } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useLoaderStore } from 'src/stores/loader-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

import { useSingleIssueStore } from 'src/stores/single-issue-store';

// helpers
import { appVisibleTimeout } from 'src/utils/visibilityApp';

// components
import PrimaryLoader from 'src/components/loaders/PrimaryLoader.vue';
import LightsNewYear from 'src/components/LightsNewYear.vue';
import ReleaseNotePreviewDialog from 'components/dialogs/ReleaseNotePreviewDialog.vue';
import SnowFall from 'src/components/SnowFall.vue';
import MainHeader from 'src/components/headers/MainHeader.vue';
import NavBar from 'src/components/drawers/NavBar.vue';

// stores
const api = useAiplanStore();
const userStore = useUserStore();
const utilsStore = useUtilsStore();
const loaderStore = useLoaderStore();
const singleIssueStore = useSingleIssueStore();
const filterStore = useFiltersStore();

// store to refs
const { currentIssueID } = storeToRefs(singleIssueStore);
const { user, userWorkspaces } = storeToRefs(userStore);
const { generalLoader } = storeToRefs(loaderStore);

const { openReleaseNote } = storeToRefs(utilsStore);

// vars
const router = useRouter();
const $q = useQuasar();
const route = useRoute();
const { auth } = storeToRefs(api);
const leftDrawerOpen = ref(false);
const refreshInterval = ref();
const isShowReleaseNote = shallowRef(false);

const setTheme = () => {
  if (userStore.getTheme === 'dark' || auth.value) {
    localStorage.setItem('dark', String(userStore.getTheme === 'dark'));
    $q.dark.set(userStore.getTheme === 'dark');
  } else $q.dark.set(false);
};

const STORAGE_KEY = 'leftDrawerOpen';

onBeforeMount(async () => {
  appVisibleTimeout(() => userStore.getUserInfo());
  currentIssueID.value = route.params.issue as string;

  await userStore.getUserInfo().then(() => {
    setTheme();
  });

  if (user.value?.status === 'На звонке') {
    await userStore.updateCurrentUser({
      status: '',
      status_emoji: '',
      status_end_date: null,
    });
  }

  if (route.name === 'filters') {
    filterStore.setFilterId(route.params.filterId as string);

    router.replace(
      `/${user.value?.last_workspace_slug || userWorkspaces.value[0]?.slug}`,
    );
    return;
  }

  isShowReleaseNote.value = openReleaseNote.value;
});
onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

useMeta({
  title: 'АИПлан | Инструмент управления проектами.',
});

const isSnowEnable = computed(() => localStorage.getItem('snow') === 'enable');

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
  localStorage.setItem(STORAGE_KEY, String(leftDrawerOpen.value));
};
</script>
