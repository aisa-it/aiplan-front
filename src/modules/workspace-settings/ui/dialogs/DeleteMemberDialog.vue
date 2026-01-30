<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление пользователя</h6>

        <span>
          Вы действительно хотите удалить
          <b>{{ choosedUser.member.email }}</b> из пространства?
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          data-id="cancel-member-delete-button"
          label="Отменить"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          data-id="approve-delete-member-button"
          label="Удалить"
          class="delete-btn"
          style="width: 100px"
          @click="deleteUser"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import { IWorkspaceMember } from 'src/interfaces/workspaces';
import { deleteWorkspaceMember } from 'src/modules/workspace-settings/services/api';

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

const emits = defineEmits(['delete', 'error']);

// refs
const { user: choosedUser } = toRefs(props);

// function
const deleteUser = async () => {
  await deleteWorkspaceMember(
    props.currentWsSlug as string,
    choosedUser.value.id,
  )
    .then(async () => {
      emits('delete');
    })
    .catch(() => emits('error'));
};
</script>
