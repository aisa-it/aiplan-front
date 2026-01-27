<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление проекта</h6>
        <span>
          Вы уверены, что хотите удалить проект
          <b>"{{ current_project.name }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          class="delete-btn"
          style="width: 100px"
          @click="handleDeleteProject"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// constants
import { SUCCESS_DELETE_PROJECT } from 'src/constants/notifications';

// interfaces
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// services
import { deleteProject } from '../../services/api';

interface IProps {
  currentProject: DtoProject;
}

const props = defineProps<IProps>();
const emits = defineEmits<{
  startLoading: [];
  endLoading: [];
}>();

const { currentProject: current_project } = toRefs(props);

const userStore = useUserStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentProjectID, project } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const router = useRouter();

const handleDeleteProject = async () => {
  emits('startLoading');
  await deleteProject(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
  )
    .then(async () => {
      await workspaceStore.getWorkspaceProjects(
        currentWorkspaceSlug.value as string,
      );
      await userStore.getFavouriteProjects(
        currentWorkspaceSlug.value as string,
      );

      router.push(`/${currentWorkspaceSlug.value}/`);
      project.value = null;

      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_DELETE_PROJECT,
      });
    })

    .finally(() => emits('endLoading'));
};
</script>
