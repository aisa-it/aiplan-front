<template>
  <q-page>
    <div
      style="padding: 46px; display: flex; flex-direction: column"
      class="justify-center centered-horisontally"
    >
      <q-img
        v-if="workspaceInfo?.logo"
        :src="`${workspaceInfo?.logo ? getUrlFile(workspaceInfo?.logo) : ''}`"
        :style="`width: 96px; height: 96px; border-radius: 16px;`"
        ><template #error>
          <div class="none-avatar text-avatar body-2">
            {{ getFirstSymbol(workspaceInfo?.name) }}
          </div>
        </template></q-img
      >
      <div
        v-else
        style="width: 96px; height: 96px; border-radius: 16px; font-size: 18px"
        class="none-avatar text-avatar"
      >
        {{ getFirstSymbol(workspaceInfo?.name) }}
      </div>
      <h5
        style="margin: 12px 0px 12px 0px; max-width: 60vw; text-align: center"
      >
        {{ workspaceInfo?.name }}
      </h5>
      <q-separator style="width: 100%" />

      <EditorTipTapV2
        v-if="defineDescription"
        editor-id="desc-editor"
        :model-value="defineDescription"
        :read-only-editor="true"
        :can-edit="false"
        class="desc-editor"
        style="border: 0px"
      />
    </div>
    <div
      v-if="
        (workspaceProjects.length === 0 ||
          !workspaceProjects?.find(
            (project) => project?.current_user_membership,
          )) &&
        !route.fullPath.includes('settings') &&
        generalLoader === false
      "
      class="empty-card"
    >
      <span> Нет доступных проектов </span>
      <q-btn
        v-if="hasPermissionByWorkspace(workspaceInfo, 'create-project')"
        label="Создать проект"
        unelevated
        class="q-mt-xs q-mb-md primary-btn"
        icon="add"
        no-caps
        dense
        :style="'padding: 6px'"
        @click="isProjectCreateOpen = true"
      />
      <NewProjectDialog v-model="isProjectCreateOpen" />
    </div>
  </q-page>
  <GuidedTour
    v-if="user?.tutorial === 0 && $q.platform.is.desktop"
    :steps="steps"
    @end-tutorial="useAiplanStore().setMeTutorial(STEP_NUM)"
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useMeta } from 'quasar';

import { useRolesStore } from 'src/stores/roles-store';
import { useLoaderStore } from 'src/stores/loader-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useUserStore } from 'src/stores/user-store';
import { useAiplanStore } from 'src/stores/aiplan-store';

import { getUrlFile, getFirstSymbol } from 'src/utils/helpers';

import NewProjectDialog from 'src/components/dialogs/NewProjectDialog.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import GuidedTour from 'src/modules/guided-tours/GuidedTour.vue';
import { steps, STEP_NUM } from 'src/modules/guided-tours/tutorials/tutorial1';

const $q = useQuasar();
const route = useRoute();

const metadata = ref({
  title: 'Загрузка...',
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

const loaderStore = useLoaderStore();
const workspaceStore = useWorkspaceStore();
const userStore = useUserStore();
const { hasPermissionByWorkspace } = useRolesStore();

const { generalLoader } = storeToRefs(loaderStore);
const { workspaceInfo, workspaceProjects } = storeToRefs(workspaceStore);
const { user } = storeToRefs(userStore);

const isProjectCreateOpen = ref(false);

const defineDescription = computed(() => workspaceInfo.value?.description);

watch(
  () => workspaceInfo?.value,
  (newVal) => {
    if (newVal?.name) metadata.value.title = `Пространство ${newVal.name}`;
  },
);
</script>

<style scoped lang="scss">
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 20px;
  gap: 14px;
}
:deep(.html-editor .html-editor__container) {
  border: 0px;
  min-height: auto;
}
:deep(.html-editor .tiptap) {
  min-height: auto;
}
</style>
