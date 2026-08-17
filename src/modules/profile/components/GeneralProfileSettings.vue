<template>
  <div class="py-6">
    <ProfileDataForm :user="user" />
    <ProfileNotificationsForm :user="user" />
    <ProfilePasswordForm />
  </div>
</template>

<script setup lang="ts">
import ProfileDataForm from './general-settings/ProfileDataForm.vue';
import ProfileNotificationsForm from './general-settings/ProfileNotificationsForm.vue';
import ProfilePasswordForm from './general-settings/ProfilePasswordForm.vue';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{
  user: DtoUser;
}>();
</script>
