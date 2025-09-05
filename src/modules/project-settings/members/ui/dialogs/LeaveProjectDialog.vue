<template>
  <q-dialog persistent>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Выход из проекта</h6>

        <span>
          Вы действительно хотите выйти из проекта
          <b>{{ project.name }}</b
          >?
        </span>
      </q-card-section>

      <q-card-section v-if="members.length === 1" class="column q-pt-none">
        <span>
          <b>Внимание!</b>
          Вы являетесь последним пользователем проекта, после выхода проект
          будет удалён.
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отмена"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Выйти"
          class="delete-btn"
          @click="leaveWorkspace"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useProjectStore } from 'src/stores/project-store';

// interfaces
import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// services
import { deleteProjectMember } from '../../services/api';

const props = defineProps<{
  members: DtoProjectMemberLight[];
}>();
// store
const userStore = useUserStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
// refs
const router = useRouter();
const { currentProjectID, project } = storeToRefs(projectStore);
const { user } = storeToRefs(userStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const leaveWorkspace = async () => {
  const memberId = props.members?.find(
    (member: DtoProjectMemberLight) => member.member_id === user.value.id,
  )?.id;
  if (!memberId) return;
  await deleteProjectMember(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
    memberId,
  ).then(async () => {
    await workspaceStore
      .getWorkspaceProjects(currentWorkspaceSlug.value as string)
      .then(() => {
        router.push(`/${currentWorkspaceSlug.value}` || '/no-workspace');
      });
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Вы вышли из проекта',
    });
  });
};
</script>
