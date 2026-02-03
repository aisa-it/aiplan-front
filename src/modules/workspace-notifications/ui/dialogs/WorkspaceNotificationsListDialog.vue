<template>
  <q-popup-proxy
    class="hide-scrollbar q-mt-sm notification-popup"
    style="margin-top: 4px !important"
    breakpoint="0"
    @hide="onHide"
  >
    <q-list class="q-pb-md">
      <q-item class="notification-popup__head items-center">
        <h5 class="text-medium q-my-none">Уведомления</h5>
        <q-space />
        <div class="flex">
          <q-btn
            v-if="isWorkspaceAdmin"
            :class="
              $q.screen.width > 768
                ? 'secondary-btn'
                : ' secondary-btn-only-icon'
            "
            no-caps
            @click="onCreate"
          >
            <AddIcon :color="'#3f75ff'"></AddIcon>
            <span v-if="Screen.width > 768"> Создать уведомление </span>
          </q-btn>
        </div>
      </q-item>
      <q-item class="q-pa-none">
        <WorkspaceNotificationsList
          :unread-notifications="unreadNotifications"
          :read-notifications="readNotifications"
          @getNotifications="onUpdate"
          @loadMore="onLoadMore"
          @read="onRead"
        />
      </q-item>
    </q-list>
  </q-popup-proxy>
</template>

<script setup lang="ts">
//core
import { computed } from 'vue';
import { Screen } from 'quasar';
import { storeToRefs } from 'pinia';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
//interfaces
import { NotificationsNotificationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
// components
import WorkspaceNotificationsList from 'src/modules/workspace-notifications/ui/WorkspaceNotificationsList.vue';
import AddIcon from 'src/components/icons/AddIcon.vue';

defineProps<{
  unreadNotifications: NotificationsNotificationResponse[];
  readNotifications: NotificationsNotificationResponse[];
}>();

const emits = defineEmits<{
  hide: [];
  create: [];
  update: [];
  loadMore: [];
  read: [];
}>();

const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();

const { userWorkspaces } = storeToRefs(userStore);
const { workspaceInfo } = storeToRefs(workspaceStore);

const onCreate = () => {
  emits('create');
};

const onUpdate = () => {
  emits('update');
};

const onRead = () => {
  emits('read');
};

const onLoadMore = () => {
  emits('loadMore');
};

const onHide = () => {
  emits('hide');
};

const isWorkspaceAdmin = computed(() => {
  const role = userWorkspaces.value.find(
    (workspace) => workspace.id === workspaceInfo?.value?.id,
  )?.current_user_membership?.role;
  return role && role >= 15;
});
</script>

<style lang="scss" scoped>
.notification-popup {
  &__head {
    padding: 24px 24px 16px;
  }
}
.btn :deep(.q-btn__content) {
  overflow: visible !important;
}
</style>
