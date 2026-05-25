<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Редактирование проекта</h6>
        <span v-if="!isWorkspaceMember">
          Вы будете добавлены в пространство
          <span class="text-weight-bold">{{
            project?.workspace_detail?.name
          }}</span>
          с ролью администратора
        </span>
        <span>
          Вы будете добавлены в проект
          <span class="text-weight-bold">{{ project?.name }}</span> с ролью
          администратора
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <q-btn
          flat
          no-caps
          class="btn primary-btn"
          label="Продолжить"
          v-close-popup
          @click="updateUserRole"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//types
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//services
import { api as adminApi } from 'src/modules/admin-panel/services/api';

//components
import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{
  project?: DtoProject;
  userId?: string;
  isWorkspaceMember?: boolean;
}>();
const emits = defineEmits<{ success: []; error: [] }>();

//methods
const updateUserRole = async () => {
  if (!props.project || !props.userId) return;
  try {
    if (!props.isWorkspaceMember) {
      await adminApi.changeUserRoleInWorkspace(
        props.project.workspace_detail?.id ?? '',
        props.userId,
        { role: 15 },
      );
    }
    await adminApi.changeUserRoleInProject(
      props.project.workspace_detail?.id ?? '',
      props.userId,
      props.project.id ?? '',
      { role: 15 },
    );
    emits('success');
  } catch {
    emits('error');
  }
};
</script>
