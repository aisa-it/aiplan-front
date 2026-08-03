<template>
  <v-menu
    v-model="menu"
    location="bottom"
    transition="scale-transition"
    :close-on-content-click="false"
  >
    <template #activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="inline-flex cursor-pointer">
        <UserStatus :user="user" />
      </div>
    </template>
    <UserStatusForm v-model="form" @save="handleSave" @reset="handleReset" />
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import UserStatus from './shared/UserStatus.vue';
import UserStatusForm from './components/UserStatusForm.vue';

import { useUserStatusForm } from './composables/useUserStatusForm.ts';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const menu = ref(false);

const { form, reset, buildPayload, setUser } = useUserStatusForm();

const handleReset = async () => {
  reset();
  menu.value = false;
};

const handleSave = async () => {
  const payload = buildPayload();

  console.log(payload);

  props.user.status = payload.status;
  props.user.status_emoji = payload.status_emoji;
  props.user.status_end_date = payload.status_end_date;
  // await userStore.updateCurrentUser(payload);

  menu.value = false;
};

watch(
  () => [
    props.user.status,
    props.user.status_emoji,
    props.user.status_end_date,
  ],
  () => {
    setUser(props.user);
  },
  { immediate: true },
);
</script>
