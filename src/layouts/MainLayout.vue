<template>
  <q-layout
    v-show="$q.loading.isActive === false"
    view="hHh Lpr lff"
    style="max-height: 100%; max-width: 100%"
  >
    <LightsNewYear v-if="utilsStore.ny === true" />
    <SnowFall v-if="utilsStore.ny === true && isSnowEnable" />
    <div>
      <MainHeader />
      <PrimaryLoader v-show="generalLoader === true" />

      <template v-if="!isAiDocRoute">
        <MainLayoutDrawer
          v-if="!miniState"
          v-model:drawer-open="leftDrawerOpen"
          @close="miniState = true"
        />
        <NavBar v-else v-model:mini-state="miniState" />
      </template>

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
import MainLayoutDrawer from 'src/components/drawers/MainLayoutDrawer.vue';
import { watch } from 'vue';
import { useWorkspaceStoreV2 } from 'src/stores/workspace-store-v2';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';
import { isServerVersionNewer } from 'src/utils/helpers';

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

const rolesStore = useRolesStore();
const workspaceStore = useWorkspaceStore();
const { openReleaseNote } = storeToRefs(utilsStore);
const { workspaceInfo, currentWorkspaceSlug, meInWorkspace } =
  storeToRefs(workspaceStore);

// vars
const router = useRouter();
const $q = useQuasar();
const route = useRoute();
const { auth } = storeToRefs(api);
const leftDrawerOpen = ref(true);
const refreshInterval = ref();
const isShowReleaseNote = shallowRef(false);
const { workspace } = storeToRefs(useWorkspaceStoreV2());

const setTheme = () => {
  if (userStore.getTheme === 'dark' || auth.value) {
    localStorage.setItem('dark', String(userStore.getTheme === 'dark'));
    $q.dark.set(userStore.getTheme === 'dark');
  } else $q.dark.set(false);
};

// const STORAGE_KEY = 'leftDrawerOpen';
const STORAGE_KEY = 'isMiniState';

const miniState = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'true'));

watch(miniState, (value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
});

onBeforeMount(async () => {
  appVisibleTimeout(() => userStore.getUserInfo());
  currentIssueID.value = route.params.issue as string;

  //TODO сделать тему
  // await userStore.getUserInfo().then(() => {
  //   setTheme();
  // });

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

  await utilsStore.getVersion().then(async (data) => {
    await utilsStore.getReleaseNotes().then((d) => {
      if (!d?.length) return;

      if (d[0].tag_name !== data.version) return;

      if (isServerVersionNewer(data.version)) {
        localStorage.setItem('appVersion', data.version);
        utilsStore.openReleaseNote = true;
      }
    });
  });

  isShowReleaseNote.value = openReleaseNote.value;
});
onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

useMeta({
  title: 'АИПлан | Инструмент управления проектами.',
});

const isSnowEnable = computed(() => localStorage.getItem('snow') === 'enable');
const isAiDocRoute = computed(() => route.path.includes('/aidoc'));

// TODO: убрать
watch(
  () => workspace?.value,
  async () => {
    workspaceInfo.value = workspace.value;
    currentWorkspaceSlug.value = workspace?.value?.slug;
    await workspaceStore.getMeInWorkspace(currentWorkspaceSlug.value);
    rolesStore.defineWorkspaceRole(meInWorkspace.value);
  },
  { immediate: true },
);
</script>
