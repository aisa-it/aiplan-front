<template>
  <q-page>
    <p>Здесь будет страница с задачами</p>
  </q-page>
</template>

<script lang="ts" setup>
// v-show="!isLoadProjectInfo"
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

import { getSprint } from 'src/modules/sprints/services/api';

// import { storeToRefs } from 'pinia';
// import { useProjectStore } from 'src/stores/project-store';
// import { useWorkspaceStore } from 'src/stores/workspace-store';
// import { useViewPropsStore } from 'src/stores/view-props-store';

// import { getSprints, createSprint } from 'src/modules/sprints/services/api';

const router = useRouter();
// const projectStore = useProjectStore();
// const workspaceStore = useWorkspaceStore();
// const viewProps = useViewPropsStore();
// const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);
// const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// const getCurrentProject = async () => {
//   isLoadProjectInfo.value = true;
//   currentProjectID.value = 'LED';

//   await projectStore.getProjectInfo(
//     router.currentRoute.value.params.workspace as string,
//     'LED',
//   );
//   await projectStore.getMeInProject(
//     router.currentRoute.value.params.workspace as string,
//     'LED',
//   );
//   await viewProps.getProjectProps();
//   isLoadProjectInfo.value = false;
// };

onMounted(async () => {
  const res = await getSprint(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.sprint as string,
  );
  console.log(res);
});
</script>
