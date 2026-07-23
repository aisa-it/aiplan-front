import { useRoute } from 'vue-router';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';

const projectStore = useProjectStore();
const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);

export const useLoadProjectInfo = () => {
  const route = useRoute();

  const getProjectInfo = async () => {
    if (!route.params.workspace || !route.params.project) return;
    await projectStore.getProjectInfo(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getMeInProject = async () => {
    if (!route.params.workspace || !route.params.project) return;
    await projectStore.getMeInProject(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getStatuses = async () => {
    if (!route.params.workspace || !route.params.project) return;
    await projectStore.getProjectStatuses(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getLabels = async () => {
    if (!route.params.workspace || !route.params.project) return;
    await projectStore.getProjectLabels(
      route.params.workspace as string,
      route.params.project as string,
    );
  };

  const getMembers = async () => {
    if (!route.params.workspace || !route.params.project) return;
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
