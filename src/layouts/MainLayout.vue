<template>
  <q-layout
    v-show="$q.loading.isActive === false"
    view="lHh Lpr lFf"
    style="max-height: 100%; max-width: 100%"
  >
    <LightsNewYear v-if="utilsStore.ny === true"></LightsNewYear>
    <SnowFall v-if="utilsStore.ny === true && isSnowEnable" />
    <div>
      <MainHeader @toggle="toggleLeftDrawer()" />
      <PrimaryLoader v-show="generalLoader === true" />

      <MainLayoutDrawer v-model:drawer-open="leftDrawerOpen" />

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

    <ReleaseNotePreviewDialog v-model="openReleaseNote" />
  </q-layout>
</template>

<script lang="ts" setup>
// core
import { useQuasar, useMeta, EventBus } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { ref, watch, computed, onUnmounted, onBeforeMount, inject } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useLoaderStore } from 'src/stores/loader-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

import { useSingleIssueStore } from 'src/stores/single-issue-store';

// helpers
import { isServerVersionNewer } from 'src/utils/helpers';
import { appVisibleTimeout } from 'src/utils/visibilityApp';

// components
import PrimaryLoader from 'src/components/loaders/PrimaryLoader.vue';
import LightsNewYear from 'src/components/LightsNewYear.vue';
import ReleaseNotePreviewDialog from 'components/dialogs/ReleaseNotePreviewDialog.vue';
import SnowFall from 'src/components/SnowFall.vue';
import MainLayoutDrawer from 'components/drawers/MainLayoutDrawer.vue';
import MainHeader from 'src/components/headers/MainHeader.vue';

import { useGlobalLoading } from 'src/composables/useGlobalLoader';
import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
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

const setTheme = () => {
  if (userStore.getTheme === 'dark' || auth.value) {
    localStorage.setItem('dark', String(userStore.getTheme === 'dark'));
    $q.dark.set(userStore.getTheme === 'dark');
  } else $q.dark.set(false);
};

const utilsRefresh = async () => {
  if (user.value?.id) {
    await utilsStore.getVersion().then(async (data) => {
      await utilsStore.getReleaseNotes().then((d) => {
        if (!d?.length) return;

        if (d[0].tag_name !== data.version) return;

        if (isServerVersionNewer(data.version)) {
          localStorage.setItem('appVersion', data.version);
          openReleaseNote.value = true;
        }
      });
    });
  }
};

// TODO продумать как оперативно рефрешить тему, сейчас отключаем долбежку me, чтобы убрать эпилепсию экрана
const userInfoRefresh = async () => {
  clearInterval(refreshInterval.value);
  refreshInterval.value = setInterval(
    async () =>
      !user.value?.id
        ? await userStore.getUserInfo()
        : clearInterval(refreshInterval.value),
    5000,
  );
};

const loadAllData = async () => {
  await Promise.allSettled([utilsRefresh(), userInfoRefresh()]);
};
const bus = inject('bus') as EventBus;

onBeforeMount(async () => {
  appVisibleTimeout(() => userStore.getUserInfo());

  useGlobalLoading();

  currentIssueID.value = route.params.issue as string;

  await Promise.all([
    loadAllData(),
    userStore.getUserInfo(),
    userStore.getUserWorkspaces(),
    userStore.getUserProjects(),
  ]);

  bus.emit('successLoadUserInfo');

  if (user.value.status === 'На звонке') {
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

  if (
    !route.params.workspace &&
    !router.currentRoute.value.fullPath.includes('profile') &&
    (user.value?.last_workspace_slug || userWorkspaces.value.length)
  ) {
    router.push(
      `${user.value?.last_workspace_slug || userWorkspaces.value[0]?.slug}`,
    );
  }
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

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
    utilsRefresh();
    setTheme();
  },
  {
    deep: true,
  },
);
useMeta({
  title: 'АИПлан | Инструмент управления проектами.',
});

const isSnowEnable = computed(() => localStorage.getItem('snow') === 'enable');

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
