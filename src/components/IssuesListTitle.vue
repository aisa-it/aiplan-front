<template>
  <div
    class="q-table__title abbriviated-text"
    :style="' max-width: calc(100% - 60px)'"
  >
    <transition name="fade">
      <span v-if="currentProjectID && isLoadProjectInfo === false">
        Задачи проекта {{ project?.name }}
      </span>
    </transition>

    <q-skeleton
      v-if="isLoadProjectInfo"
      text
      style="width: 300px"
      animation="blink"
    />
  </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';

import { useAiplanStore } from 'src/stores/aiplan-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useViewPropsStore } from 'src/stores/view-props-store';

export default defineComponent({
  name: 'IssuesListTitle',
  setup() {
    const api = useAiplanStore();
    const viewProps = useViewPropsStore();
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();

    const { currentProjectID, project, isLoadProjectInfo } =
      storeToRefs(projectStore);

    const { currentWorkspaceSlug, workspaceInfo } = storeToRefs(workspaceStore);
    return {
      api,
      project,
      viewProps,
      workspaceInfo,
      currentProjectID,
      currentWorkspaceSlug,
      isLoadProjectInfo,
    };
  },
});
</script>
