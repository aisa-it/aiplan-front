<template>
  <div class="h-full">
    <div class="p-[46px] flex flex-col justify-center items-center">
      <v-img
        v-if="workspaceInfo?.logo"
        :src="workspaceInfo?.logo ?? ''"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { useDisplay } from 'vuetify';

import newYearTree from '@/assets/newYearTree.svg';
import womanDayLogo from '@/assets/woman-day-logo.png';
import GuidedTour from '@/modules/guided-tours/GuidedTour.vue';
import { steps, STEP_NUM } from '@/modules/guided-tours/tutorials/tutorial1';
import NewProjectDialog from '@/components/dialogs/NewProjectDialog.vue';

const route = useRoute();
const { mobile } = useDisplay();

// ---------------------------------------------------------------------------
// TODO: Заглушки — после переноса сторов и утилит заменить на реальные импорты:
//   import { storeToRefs } from 'pinia';
//   import { useLoaderStore } from '@/stores/loader-store';
//   import { useWorkspaceStore } from '@/stores/workspace-store';
//   import { useUserStore } from '@/stores/user-store';
//   import { useRolesStore } from '@/stores/roles-store';
//   import { useUtilsStore } from '@/stores/utils-store';
//   import { getUrlFile, getFirstSymbol } from '@/utils/helpers';
// ---------------------------------------------------------------------------

// Заглушка: getUrlFile (из @/utils/helpers)
// const getUrlFile = (url: string) => url;

// Заглушка: getFirstSymbol (из @/utils/helpers)
const getFirstSymbol = (name?: string) => name?.charAt(0)?.toUpperCase() ?? '';

// Заглушка: useLoaderStore → generalLoader
const generalLoader = ref(false);

// Заглушка: useWorkspaceStore → workspaceInfo, workspaceProjects
const workspaceInfo = ref<Record<string, any> | undefined>(undefined);
const workspaceProjects = ref<any[]>([]);

// Заглушка: useUserStore → user
const user = ref<Record<string, any> | undefined>({ tutorial: 0 });

// Заглушка: useUtilsStore → ny, wd (праздничные флаги)
const ny = ref(false);
const wd = ref(false);

// Заглушка: userStore.setMeTutorial
const onEndTutorial = () => {
  console.log('[STUB] userStore.setMeTutorial(STEP_NUM)');
};

// ---------------------------------------------------------------------------

const isProjectCreateOpen = ref(false);
const defineDescription = computed(() => workspaceInfo.value?.description);

useTitle(
  computed(() =>
    workspaceInfo.value?.name
      ? `Пространство ${workspaceInfo.value.name}`
      : 'Загрузка...',
  ),
);
</script>
