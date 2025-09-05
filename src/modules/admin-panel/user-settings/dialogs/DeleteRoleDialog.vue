<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">
          {{ typeDelete.title }}
        </h6>
        <div class="q-mt-md">
          <b>
            {{ typeDelete.correct }}
          </b>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <DeleteButton v-close-popup @click="typeDelete.action" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';

import CancelButton from 'src/components/buttons/CancelButton.vue';
import DeleteButton from 'src/components/buttons/DeleteButton.vue';

import { api } from '../services/api';

import { useDeleteRoleDialogStore } from '../store/store';

const props = defineProps<{
  wsId: string;
  projectId?: string;
  userId: string;
}>();

const { userId, wsId, projectId } = toRefs(props);

const store = useDeleteRoleDialogStore();

const deleteFromWs = async () => {
  await api
    .deleteUserFromWorkspace(userId.value, wsId.value)
    .then(() => store.success())
    .catch(() => store.closeDialog());
};

const deleteFromProject = async () => {
  await api
    .deleteUserFromProject(userId.value, wsId.value, projectId.value ?? '')
    .then(() => store.success())
    .catch(() => store.closeDialog());
};

const typesDelete = {
  deleteFromWorkspace: {
    title: ' Удаление пользователя из рабочего пространства',
    correct: 'Вы уверены, что хотите удалить пользователя из пространства?',
    action: deleteFromWs,
  },
  deleteFromProject: {
    title: ' Удаление пользователя из проекта',
    correct: 'Вы уверены, что хотите удалить пользователя из проекта?',
    action: deleteFromProject,
  },
};

const typeDelete = computed(() =>
  props.projectId
    ? typesDelete.deleteFromProject
    : typesDelete.deleteFromWorkspace,
);
</script>
