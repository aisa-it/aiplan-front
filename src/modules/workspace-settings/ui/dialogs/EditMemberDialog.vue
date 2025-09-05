<template>
  <q-dialog @hide="userEmail = ''">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Редактирование пользователя</h6>

        <q-select
          dense
          class="base-selector"
          v-model="currentRole"
          :options="ROLES"
          @update:model-value="handleUpdateCurrentRole"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn no-caps label="Отменить" class="secondary-btn" v-close-popup />
        <q-btn
          no-caps
          label="Изменить"
          class="primary-btn"
          @click="async () => await changeRole()"
          v-close-popup
        />
      </q-card-actions>
      <q-card-section v-if="!targetUser.member?.email" class="column">
        <p style="color: rgb(193, 0, 21)">Необходимо установить email</p>
        <q-input v-model="userEmail" label="Email" dense class="base-input" />
        <q-btn class="primary-btn self-end q-mt-sm" @click="handleSetEmail">
          Сохранить
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { ref, toRefs, watch } from 'vue';

// utils
import { ROLES } from 'src/constants/constants';
import { IWorkspaceMember } from 'src/interfaces/workspaces';
import {
  setMemberEmail,
  updateWorkspaceMember,
} from 'src/modules/workspace-settings/services/api';

// props
const props = withDefaults(
  defineProps<{
    user: IWorkspaceMember;
    currentWsSlug: string;
  }>(),
  {
    user: () => {
      return {} as IWorkspaceMember;
    },
  },
);

// emits
const emits = defineEmits(['error', 'update']);

// to refs
const { user: targetUser } = toRefs(props);

// refs
const currentRole = ref();
const userEmail = ref('');

const handleSetEmail = async () => {
  return setMemberEmail(props.currentWsSlug, targetUser.value.member_id, {
    email: userEmail.value,
  })
    .then(() => emits('update'))
    .catch(() => emits('error'));
};

const changeRole = async () => {
  await updateWorkspaceMember(props.currentWsSlug, targetUser.value.id, {
    role: currentRole.value.value,
  })
    .then(() => {
      emits('update');
    })
    .catch(() => emits('error'));
};

const handleUpdateCurrentRole = (e: any) => {
  targetUser.value.role = e.value;
};

watch(
  () => targetUser.value,
  () => {
    currentRole.value = ROLES.find(
      (role) => role.value === targetUser.value.role,
    );
  },
  { deep: true },
);
</script>
