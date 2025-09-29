<template>
  <ExpansionItem
    type="jitsi"
    :isExpanding="isConfOpen"
    itemName="jitsi"
    ref="jitsiExpansion"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <UsersIcon v-show="unreadCountRef === 0" class="q-mr-md" />
        <ChatIconUnread v-show="unreadCountRef > 0" class="q-mr-md" />
      </q-item-section>

      <q-item-section> Конференция </q-item-section>

      <q-item-section side>
        <q-btn
          dense
          flat
          text-color="primary"
          class="fully-centered"
          @click.stop.prevent="openConf(true)"
          ><q-icon name="fullscreen" dense size="24px"
        /></q-btn>
      </q-item-section>
    </template>
    <template v-slot:content>
      <q-card>
        <q-card-section style="padding: 0; min-height: 400px">
          <div
            :class="isConfOpen ? 'fullscreen-bg' : 'compact-bg'"
            @click="openConf(false)"
          >
            <div :class="isConfOpen ? 'fullscreen' : 'compact'">
              <JitsiMeeting
                v-if="shouldMount"
                :key="workspace + key"
                :domain="jitsiDomain"
                :room-name="workspace"
                lang="ru"
                :jwt="token"
                :width="'100%'"
                :height="'100%'"
                @on-ready-to-close="
                  () => {
                    isConfOpen = false;
                    key++;
                  }
                "
                @on-api-ready="(externalApi) => handleApiReady(externalApi)"
                :configOverwrite="{
                  enableWelcomePage: false,
                  prejoinConfig: {
                    enabled: true,
                  },
                  disableProfile: true,
                  readOnlyName: true,
                  enableClosePage: true,
                }"
              >
                <template v-slot:spinner>
                  <div
                    style="width: 100%; height: 100%"
                    class="row justify-center items-center jitsi-spiner"
                  >
                    <DefaultLoader />
                  </div>
                </template>
              </JitsiMeeting>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
//core
import { ref, watch, computed } from 'vue';
import { JitsiMeeting } from '@jitsi/vue-sdk';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
//stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useUserStore } from 'src/stores/user-store';
//components
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import { useNotificationStore } from 'src/stores/notification-store';
import ExpansionItem from 'components/ExpansionItem.vue';
import ChatIconUnread from 'src/components/icons/ChatIconUnread.vue';
//icons
import UsersIcon from 'src/components/icons/UsersIcon.vue';
import { api } from 'src/stores/aiplan-store';

//stores
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const notificationStore = useNotificationStore();

//storesToRefs
const { workspaceInfo } = storeToRefs(workspaceStore);
const { user } = storeToRefs(userStore);

//composables
const route = useRoute();

//state
const token = ref();
const jitsiDomain = ref('');
const key = ref(0);
const apiRef = ref();
const unreadCountRef = ref(0);
const isConfOpen = ref(false);
const isExpanded = ref(false);
const isJoined = ref(false);

const jitsiExpansion = ref<InstanceType<typeof ExpansionItem> | null>(null);

//computeds
const workspace = computed(() => {
  return workspaceInfo.value?.name || route.params.workspaceSlug;
});

const shouldMount = computed(() => {
  const hasAddress = !!token.value && !!jitsiDomain.value;
  const isExpanded = jitsiExpansion.value?.isExpanded;
  return hasAddress && (isExpanded || isJoined.value);
});

//methods
const handleApiReady = (apiObj) => {
  apiRef.value = apiObj;

  // Events
  apiRef.value.on('videoConferenceJoined', () => {
    isJoined.value = true;
    if (jitsiExpansion.value?.isExpanded) handleUpdateUserStatus(true);
  });
  apiRef.value.on('videoConferenceLeft', () => {
    isJoined.value = false;
    if (jitsiExpansion.value?.isExpanded) handleUpdateUserStatus(false);
  });
  apiRef.value.on('participantJoined', (payload) => {
    notificationStore.setNotificationView({
      open: true,
      type: 'info',
      customTitle: 'Конференция',
      customMessage: `${payload.displayName} подключился к конференции`,
    });
  });
  apiRef.value.on('participantLeft', (payload) => {
    if (!!payload.displayName) {
      notificationStore.setNotificationView({
        open: true,
        type: 'info',
        customTitle: 'Конференция',
        customMessage: `${payload.displayName} покинул конференцию`,
      });
    }
  });
  apiRef.value.on('incomingMessage', (payload) => {
    notificationStore.setNotificationView({
      open: true,
      type: 'info',
      customTitle: 'Сообщение в конференции',
      customMessage: `${payload.nick}: ${payload.message}`,
    });
  });
  apiRef.value.on('chatUpdated', (payload) => {
    unreadCountRef.value = payload.unreadCount;
  });
};

const openConf = (val: boolean) => {
  isConfOpen.value = val;

  const meeting = document.querySelector('[id^="jitsiMeeting"]') as HTMLElement;
  if (meeting) {
    meeting.style.height = val ? '90vh' : '100%';
  }
};

const handleUpdateUserStatus = async (isCalling: boolean) => {
  if (user.value.status && user.value.status != 'На звонке') return;

  const userStatus = {
    status: isCalling ? 'На звонке' : '',
    status_emoji: isCalling ? '🎧' : '',
    status_end_date: null,
  };

  await userStore.updateCurrentUser({
    ...userStatus,
  });
};

//lifecycle hooks
watch(
  () => workspaceStore.currentWorkspaceSlug,
  async (newVal) => {
    if (newVal && newVal !== 'undefined') {
      await api
        .get('/api/auth/jitsi-url/')
        .then(({ data }) => (jitsiDomain.value = data.url));

      await workspaceStore.getJitsiToken(newVal).then((resp) => {
        token.value = resp?.jitsi_token;
      });
    }
  },
  { immediate: true },
);

watch(
  () => isConfOpen.value,
  () => (isExpanded.value = isConfOpen.value ? true : isExpanded.value),
);

watch(
  () => user.value.status,
  (newStatus) => {
    if (jitsiExpansion.value?.isExpanded && (!newStatus || newStatus === '')) {
      handleUpdateUserStatus(true);
    }
  },
);
</script>
<style scoped>
.fullscreen-bg {
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  width: 100vw;
  height: 100vh;
  padding: 2.5vh 5vw;
}

.fullscreen {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.35s ease-in-out;
}

.compact-bg {
  width: 100%;
  height: 400px;
  position: relative;
  transition: all 0.35s ease-in-out;
}

.compact {
  width: 100%;
  height: 400px;
  display: inline-grid;
  position: relative;
}

.compact:has(.jitsi-spiner) {
  display: block;
}
</style>
