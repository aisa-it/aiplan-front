<template>
  <v-menu
    location="bottom"
    transition="scale-transition"
    :close-on-content-click="false"
  >
    <template #activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="inline-flex cursor-pointer">
        <UserStatus :user="user" />
      </div>
    </template>
    <UserStatusForm v-model="form" @save="handleSave" @reset="reset" />
  </v-menu>
</template>

<script setup lang="ts">
import UserStatus from './shared/UserStatus.vue';
import UserStatusForm from './components/UserStatusForm.vue';

import { useUserStatusForm } from './composables/useUserStatusForm.ts';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { watch } from 'vue';

const props = defineProps<{
  user: DtoUser;
}>();

const { form, reset, buildPayload, setUser } = useUserStatusForm();

const handleSave = async () => {
  const payload = buildPayload();

  console.log(payload);

  // await userStore.updateCurrentUser(payload);
};

watch(
  () => props.user,
  (user) => {
    setUser(user);
  },
  { immediate: true },
);
</script>
