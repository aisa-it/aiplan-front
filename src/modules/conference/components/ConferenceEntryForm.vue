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
      :bg-color="isNight ? '#383838' : 'white'"
      :rules="[(value) => !!value?.length || 'Введите название комнаты']"
      label="Имя комнаты"
      class="w-full"
      :theme="isNight ? 'dark' : 'light'"
    />
    <div class="flex flex-row items-center flex-nowrap gap-2">
      <v-btn
        color="primary"
        class="text-none"
        height="40"
        variant="flat"
        @click="connectToConference()"
      >
        <span v-if="smAndUp">Начать встречу</span>
        <v-icon v-else>mdi-check</v-icon>
      </v-btn>
      <v-btn
        variant="flat"
        height="40"
        width="40"
        min-width="40"
        class="px-0 min-w-0"
        :class="
          isNight
            ? 'bg-[#383838] border border-[#5e5e5e] text-[#bac4d5]'
            : 'bg-[#ffffff7a] text-[#474a52]'
        "
        @click="copyLinkToConference"
      >
        <v-icon>mdi-link-variant</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Скопировать ссылку
        </v-tooltip>
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
// core
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user-store';

const { user } = storeToRefs(useUserStore());
const { smAndUp } = useDisplay();
const route = useRoute();
const roomName = ref(user.value?.last_workspace_slug || '');
const formRef = ref();

defineProps<{
  isNight: boolean;
}>();

onMounted(async () => {
  await useUserStore().getUserInfo();

  const roomParam = route.params.roomName;
  const parsedRoomName = Array.isArray(roomParam) ? roomParam[0] : roomParam;

  if (parsedRoomName) {
    roomName.value = parsedRoomName;
    connectToConference(true);
  } else {
    roomName.value = user.value?.last_workspace_slug || '';
  }
});

const connectToConference = async (routeByQuery = false) => {
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

const copyLinkToConference = () => {
  //TODO: Добавит уведомление об успехе
  navigator.clipboard.writeText(
    `${location.protocol}//${location.host}/conf/${roomName.value}/`,
  );
};
</script>
