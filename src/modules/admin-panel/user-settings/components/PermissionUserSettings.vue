<template>
  <div class="row">
    <WsView :userId="user.id ?? ''" @get-ws="updateWs" />

    <q-separator v-if="!$q.screen.lt.md" class="q-mr-sm q-ml-sm" vertical />

    <ProjectView :user-id="user.id ?? ''" :ws="ws" v-if="!$q.screen.lt.md" />

    <DeleteRoleDialog
      v-model="store.show"
      :wsId="store.wsId ?? ''"
      :projectId="store.projectId"
      :userId="store.userId ?? ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

import WsView from './WsView.vue';
import ProjectView from './ProjectView.vue';
import DeleteRoleDialog from '../dialogs/DeleteRoleDialog.vue';

import { useDeleteRoleDialogStore } from '../store/store';
import {
  DtoUserLight,
  DtoWorkspace,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{ user: DtoUserLight }>();

const $q = useQuasar();
const ws = ref<DtoWorkspace | undefined>();
const store = useDeleteRoleDialogStore();

const updateWs = (newWs: DtoWorkspace) => {
  ws.value = newWs;
};
</script>
