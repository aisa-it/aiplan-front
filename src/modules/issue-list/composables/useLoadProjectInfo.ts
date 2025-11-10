import { useRoute } from 'vue-router';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { NEW_GROUP_BY_OPTIONS, PARSED_GROUP } from 'src/constants/constants';

const projectStore = useProjectStore();
const viewProps = useViewPropsStore();
const { currentProjectID, isLoadProjectInfo, projectProps } =
  storeToRefs(projectStore);

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
  const getProps = async () => {
    await viewProps.getProjectProps();
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

    await getProps();
    isLoadProjectInfo.value = false;
  };

  return { getAllProjectInfo };
};
