<template>
  <q-banner
    v-if="false"
    inline-actions
    rounded
    :class="`top-banner elevator-14 ${content.class}`"
  >
    <template v-slot:avatar>
      <q-icon
        class="icon"
        :name="content.icon"
        :color="$q.dark.isActive ? '' : 'dark'"
        dense
        size="16px"
      />
    </template>

    <div class="banner-title">
      {{ content.title }}
    </div>
    <div class="banner-text">
      {{ content.message }}
    </div>

    <template v-slot:action>
      <q-btn
        v-if="!notificationState.logs"
        flat
        dense
        rounded
        icon="close"
        class="q-mr-sm"
        @click="handleClose"
      />
    </template>
  </q-banner>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { BASE_ERROR, SUCCESS_UPDATE_DATA } from 'src/constants/notifications';
import { INotification } from 'src/interfaces/notifications';
import { useNotificationStore } from 'src/stores/notification-store';
import { logsRUS } from 'src/utils/translator';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'NotificationAlert',

  setup() {
    const q = useQuasar();
    const setNotificationType = (type: string) => {
      return;
    };

    const store = useNotificationStore();
    const { notificationState } = storeToRefs(store);

    const isOpen = ref(
      notificationState.value ? notificationState.value.open : false,
    );

    const content = ref<INotification>(
      setNotificationType(
        notificationState.value ? notificationState.value.type : '',
      ),
    );

    const handleClose = async () => {
      isOpen.value = false;
      store.clearNotificationView();
    };

    const autoClose = () =>
      setTimeout(() => {
        isOpen.value = false;
        store.clearNotificationView();
      }, 10000);

    watch(notificationState, () => {
      isOpen.value = store.getCurrentState.open;
      content.value = setNotificationType(store.getCurrentState.type);
    });

    watch(notificationState, () => {
      store.getCurrentState.open === true ? autoClose() : null;
    });

    return {
      isOpen,
      content,
      notificationState,
      logsRUS,
      handleClose,
    };
  },
});
</script>
