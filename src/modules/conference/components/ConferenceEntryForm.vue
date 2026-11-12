<template>
  <v-form
    ref="formRef"
    class="flex flex-row justify-center items-start gap-3 mt-2"
    :class="smAndUp ? 'px-6' : 'px-1'"
    @submit.prevent="connectToConference()"
  >
    <v-text-field
      v-model="roomName"
      density="compact"
      variant="solo"
      flat
      bg-color="var(--conf-field-bg)"
      :rules="[
        (value) => !!value?.trim() || t('conference.roomNameRequired'),
        (value) => ROOM_NAME_RE.test(value) || t('conference.roomNameInvalid'),
      ]"
      :label="t('conference.roomName')"
      class="w-full"
      :theme="isNight ? 'dark' : 'light'"
    />
    <div class="flex flex-row items-center flex-nowrap gap-2">
      <v-btn
        color="primary"
        class="text-none"
        height="2.5rem"
        variant="flat"
        @click="connectToConference()"
      >
        <span v-if="smAndUp">{{ t('conference.startMeeting') }}</span>
        <v-icon v-else>mdi-check</v-icon>
      </v-btn>
      <v-btn
        variant="flat"
        height="2.5rem"
        width="2.5rem"
        min-width="2.5rem"
        class="px-0 min-w-0 bg-[color:var(--conf-surface)] border border-[color:var(--conf-border)] text-[color:var(--conf-text)]"
        @click="copyLinkToConference"
      >
        <v-icon>mdi-link-variant</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ t('conference.copyLink') }}
        </v-tooltip>
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
// core
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user-store';

// modules
import { toast } from '@/modules/toast';

const { user } = storeToRefs(useUserStore());
const { smAndUp } = useDisplay();
const { t } = useI18n();
const route = useRoute();
const roomName = ref(user.value?.last_workspace_slug || '');
const formRef = ref();

defineProps<{
  isNight: boolean;
}>();

const ROOM_NAME_RE = /^[\p{L}\p{N}_. -]+$/u;

onMounted(() => {
  const roomParam = route.params.roomName;
  const parsedRoomName = Array.isArray(roomParam) ? roomParam[0] : roomParam;

  if (parsedRoomName) {
    roomName.value = parsedRoomName;
    connectToConference(true);
  }
});

watch(
  () => user.value?.last_workspace_slug,
  (slug) => {
    if (!roomName.value) {
      roomName.value = slug || '';
    }
  },
  { immediate: true },
);

const connectToConference = async (routeByQuery = false) => {
  // Имя комнаты попадает в location.href, в том числе из URL (/conf/:roomName,
  // где валидация формы пропускается) — пропускаем его через белый список
  if (!ROOM_NAME_RE.test(roomName.value)) {
    toast.error(t('conference.roomNameInvalid'));
    return;
  }

  if (formRef.value) {
    const { valid } = await formRef.value.validate();
    if (!valid && !routeByQuery) return;
  }

  // for local development
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/conf/${roomName.value}/`;
  } else {
    // production
    window.location.href = `${window.location.origin}/api/auth/conf/${roomName.value}/`;
  }
};

const copyLinkToConference = async () => {
  if (!roomName.value.trim()) {
    toast.error(t('conference.roomNameRequired'));
    return;
  }
  if (!ROOM_NAME_RE.test(roomName.value)) {
    toast.error(t('conference.roomNameInvalid'));
    return;
  }

  const link = `${location.protocol}//${location.host}/conf/${roomName.value}/`;

  try {
    await navigator.clipboard.writeText(link);
    toast.success(t('common.messages.linkCopied'));
  } catch {
    toast.error(t('common.messages.linkCopyFailed'));
  }
};
</script>
