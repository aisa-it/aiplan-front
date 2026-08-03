<template>
  <div class="h-full">
    <div
      v-if="isLoading"
      class="p-[46px] flex flex-col justify-center items-center"
    >
      <v-skeleton-loader
        type="image"
        class="w-[96px] h-[96px] max-w-[96px] rounded-2xl"
      />
      <v-skeleton-loader type="heading" class="mt-4 w-[200px]" />
      <v-divider class="w-full my-4" />
      <v-skeleton-loader type="paragraph" class="w-full" />
    </div>

    <template v-else>
      <div class="p-[46px] flex flex-col justify-center items-center">
        <v-img
          v-if="workspaceInfo?.logo"
          :src="workspaceInfo?.logo ? getUrlFile(workspaceInfo.logo) : ''"
          class="w-[96px] h-[96px] max-w-[96px] rounded-2xl"
          cover
        >
          <template #error>
            <div
              class="w-full h-full text-sm flex justify-center items-center text-primary bg-[rgba(var(--v-theme-primary),0.2)]"
            >
              {{ getFirstSymbol(workspaceInfo?.name) }}
            </div>
          </template>
        </v-img>
        <div
          v-else
          class="w-[96px] h-[96px] rounded-2xl text-lg flex justify-center items-center text-primary bg-[rgba(var(--v-theme-primary),0.2)]"
        >
          {{ getFirstSymbol(workspaceInfo?.name) }}
        </div>

        <h5 class="my-3 max-w-[60vw] text-center text-xl font-medium">
          {{ workspaceInfo?.name }}
        </h5>

        <div v-if="ny" class="flex justify-center py-5 pl-[15px]">
          <v-img fit="contain" :src="newYearTree" style="width: 250px" />
        </div>
        <div v-if="wd" class="flex justify-center py-5 pl-[15px]">
          <v-img fit="contain" :src="womanDayLogo" style="width: 250px" />
        </div>

        <v-divider class="w-full my-4" />

        <div v-if="defineDescription" class="w-full">
          <div v-html="defineDescription"></div>
        </div>
      </div>

      <div
        v-if="
          workspaceProjects.length === 0 &&
          !route.fullPath.includes('settings') &&
          !generalLoader
        "
        class="flex flex-col items-center justify-center w-full pt-10 gap-3.5"
      >
        <span class="text-lg text-gray-600">Нет доступных проектов</span>
        <v-btn
          size="large"
          prepend-icon="mdi-plus"
          @click="isProjectCreateOpen = true"
        >
          Создать проект
        </v-btn>

        <NewProjectDialog v-model="isProjectCreateOpen" />
      </div>

      <GuidedTour
        v-if="user?.tutorial === STEP_NUM - 1 && !mobile"
        :steps="steps"
        :step-num="STEP_NUM"
        @end-tutorial="onEndTutorial"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { useDisplay } from 'vuetify';

import newYearTree from '@/assets/newYearTree.svg';
import womanDayLogo from '@/assets/woman-day-logo.png';
import GuidedTour from '@/modules/guided-tours/GuidedTour.vue';
import { steps, STEP_NUM } from '@/modules/guided-tours/tutorials/tutorial1';
import NewProjectDialog from '@/components/dialogs/NewProjectDialog.vue';
import { storeToRefs } from 'pinia';
import { useLoaderStore } from '@/stores/loader-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useUserStore } from '@/stores/user-store';
import { useUtilsStore } from '@/stores/utils-store';
import { getFirstSymbol, getUrlFile } from '@/utils/helpers';

const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();

const loaderStore = useLoaderStore();
const { generalLoader } = storeToRefs(loaderStore);

const workspaceStore = useWorkspaceStore();
const { workspaceInfo, workspaceProjects } = storeToRefs(workspaceStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const utilsStore = useUtilsStore();
const { ny, wd } = storeToRefs(utilsStore);

const onEndTutorial = () => {
  if (userStore.updateCurrentUser) {
    userStore.updateCurrentUser({ tutorial: STEP_NUM });
  }
};

const props = defineProps<{
  slug?: string;
}>();

const isLoading = ref(true);

const isProjectCreateOpen = ref(false);
const defineDescription = computed(() => workspaceInfo.value?.description);

useTitle(
  computed(() =>
    workspaceInfo.value?.name
      ? `Пространство ${workspaceInfo.value.name}`
      : 'Загрузка...',
  ),
);

watch(
  () => props.slug,
  async (newSlug) => {
    if (!newSlug) {
      isLoading.value = true;
      const workspaces = await userStore.getUserWorkspaces();

      if (workspaces && workspaces.length > 0) {
        const fav = workspaces.find((w) => w.is_favorite);
        const defaultSlug = fav ? fav.slug : workspaces[0].slug;
        router.replace({ query: { ...route.query, workspace: defaultSlug } });
      } else {
        isLoading.value = false;
      }
      return;
    }

    isLoading.value = true;

    try {
      await workspaceStore.getWorkspaceInfo(newSlug);
      await workspaceStore.getWorkspaceProjects(newSlug);
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true },
);
</script>
