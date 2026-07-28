<template>
  <component
    v-if="member?.status"
    :is="UserStatus"
    :status="member.status"
    :status-emoji="member.status_emoji"
    :status-end-time="member.status_end_date"
    :icon="true"
    class="absolute left-2"
  />
</template>

<script setup lang="ts">
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts.ts';
import UserStatus from './UserStatus.vue';

defineProps<{
  member?: DtoUser;
}>();
</script>
