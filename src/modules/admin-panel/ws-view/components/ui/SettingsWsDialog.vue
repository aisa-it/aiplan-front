<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Редактирование пространства</h6>
        <span>
          Вы будете добавлены в пространство
          <span class="text-weight-bold">{{ workspace?.name }}</span> с ролью
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
import { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//services
import { api as adminApi } from 'src/modules/admin-panel/services/api';
//components
import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{
  workspace?: DtoWorkspaceWithCount;
  userId?: string;
}>();
const emits = defineEmits<{ success: []; error: [] }>();

//methods
const updateUserRole = async () => {
  if (!props.workspace || !props.userId) return;
  try {
    await adminApi.changeUserRoleInWorkspace(
      props.workspace.id ?? '',
      props.userId,
      { role: 15 },
    );
    emits('success');
  } catch {
    emits('error');
  }
};
</script>
