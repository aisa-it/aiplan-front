<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Редактирование пользователя</h6>
        <q-select
          v-if="choosed_user"
          dense
          class="base-selector"
          v-model="role"
          :options="ROLES"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn no-caps label="Отменить" class="secondary-btn" v-close-popup />
        <q-btn
          no-caps
          label="Изменить"
          class="primary-btn"
          :disable="!role"
          @click="async () => await handleChangeRole()"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { onUpdated, ref, watch } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
// utils
import { valToRole } from 'src/utils/translator';

// constants
import { ROLES } from 'src/constants/constants';
import { storeToRefs } from 'pinia';

// interfaces
import {
  DtoProjectMember,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ISelect } from 'src/interfaces/ui';

// services
import { updateProjectMember } from '../../services/api';

const props = defineProps<{
  user?: DtoProjectMemberLight;
  me?: DtoProjectMember;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error'): void;
}>();
// stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

// store to refs
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const choosed_user = ref<DtoProjectMemberLight>({ ...props.user });
const role = ref<ISelect>({
  label: valToRole(props.user?.role ?? 5)?.label,
  value: props.user?.role ?? 5,
});

const refresh = (user: DtoProjectMemberLight) => {
  choosed_user.value = user;
  if (!choosed_user.value || !choosed_user.value.role) return;
  role.value = valToRole(choosed_user.value.role);
};

const handleChangeRole = async () => {
  if (!role.value.value) return;
  await updateProjectMember(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
    choosed_user.value.id as string,
    { role: +role.value.value },
  )
    .then(() => emit('success'))
    .catch(() => emit('error'));
};

onUpdated(() => {
  if (!props.user) return;
  refresh(props.user);
});

watch(
  () => props.user,
  () => {
    if (!props.user) return;
    refresh(props.user);
  },
);
</script>
