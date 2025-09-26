<template>
  <div
    class="conference-entry-form"
    :class="q.screen.width > 480 ? 'q-px-lg' : 'q-px-xs'"
    @keyup.enter="connectToConference()"
  >
    <q-input
      v-model="roomName"
      ref="inputRef"
      dense
      outlined
      :rules="[(value) => value?.length || 'Введите название комнаты']"
      label="Имя комнаты"
      class="conference-input full-w"
      :class="isNight ? 'conference-input-dark' : 'conference-input'"
    />
    <q-btn class="primary-btn" no-caps @click="connectToConference()"
      ><span v-if="q.screen.width > 480"> Начать встречу </span>
      <CheckIcon v-else
    /></q-btn>
  </div>
</template>

<script setup lang="ts">
// core
import { onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';

// components
import CheckIcon from 'src/components/icons/CheckIcon.vue';
import { useRoute } from 'vue-router';

const q = useQuasar();
const route = useRoute();
const roomName = ref();
const inputRef = ref();
defineProps<{
  isNight: boolean;
}>();

onMounted(() => {
  if (route.params.roomName?.length) {
    roomName.value = route.params.roomName;
    connectToConference(true);
  }

  if (history.state.slug) {
    roomName.value = history.state.slug;
  }
});

const connectToConference = (routeByQuery = false) => {
  inputRef.value.validate();

  if (inputRef.value.hasError && !routeByQuery) return;
  // for local development
  if (window.location.hostname == 'localhost') {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/conf/${roomName.value}/`;
  } else {
    // production
    window.location.href = `${window.location.origin}/api/auth/conf/${roomName.value}/`;
  }
};
</script>

<style scoped lang="scss">
.conference-entry-form {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: start;
  gap: 12px;
  margin-top: 8px;
}
</style>
