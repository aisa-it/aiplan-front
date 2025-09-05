<template>
  <q-dialog persistent>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Выход из пространства</h6>

        <span>
          Вы действительно хотите выйти из пространства
          <b>{{ computedWorkspaceInfo?.name }}</b
          >?
        </span>
      </q-card-section>

      <q-card-section v-if="members.length === 1" class="column q-pt-none">
        <span>
          <b>Внимание!</b>
          Вы являетесь последним пользователем пространства, после выхода
          пространство будет удалено.
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
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { deleteWorkspaceMember } from 'src/modules/workspace-settings/services/api';

// props
const props = defineProps<{
  members: [];
  currentWsSlug: string;
  currentWsInfo: object;
  isInAdminPanel: boolean;
}>();
const emit = defineEmits(['refreshData']);

// store
const userStore = useUserStore();
const { setNotificationView } = useNotificationStore();
// refs
const router = useRouter();
const { user, userWorkspaces } = storeToRefs(userStore);

const computedWorkspaceInfo = computed(() => props.currentWsInfo);

const leaveWorkspace = async () => {
  await deleteWorkspaceMember(
    props.currentWsSlug as string,
    props.members?.find((member: any) => member.member_id === user.value.id)
      ?.id,
  ).then(async () => {
    await userStore.getUserWorkspaces().then(() => {
      if (props.isInAdminPanel) {
        emit('refreshData');
      } else {
        router.push(
          userWorkspaces.value.length
            ? `/${userWorkspaces.value[0]?.slug}`
            : '/no-workspace',
        );
      }
    });
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Вы вышли из пространства',
    });
  });
};
</script>
