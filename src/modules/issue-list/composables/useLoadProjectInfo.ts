import { useRoute } from 'vue-router';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';

const projectStore = useProjectStore();
const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);

export const useLoadProjectInfo = () => {
  const route = useRoute();

  const getProjectInfo = async () => {
    await projectStore.getProjectInfo(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getMeInProject = async () => {
    await projectStore.getMeInProject(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getStatuses = async () => {
    await projectStore.getProjectStatuses(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getLabels = async () => {
    await projectStore.getProjectLabels(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getMembers = async () => {
    await projectStore.getProjectMembers(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getAllProjectInfo = async (): Promise<void> => {
    isLoadProjectInfo.value = true;
    currentProjectID.value = route.params.project as string;
    await getProjectInfo();
    await getMeInProject();

    await getStatuses();
    await getLabels();
    await getMembers();

    isLoadProjectInfo.value = false;
  };

  return { getAllProjectInfo };
};
