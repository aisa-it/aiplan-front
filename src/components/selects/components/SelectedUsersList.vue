<template>
  <div v-if="users" class="selected-users-list ellipsis">
    <span class="text-subtitle2">
      <template v-for="(user, index) in sortedUsers" :key="user.member?.id">
        <span
          v-if="currentUser?.id === user.member?.id"
          style="color: var(--primary); font-weight: 500"
          >Вы</span
        >
        <template v-else>{{ getFullName(user.member) }}</template>
        <template v-if="index < sortedUsers.length - 1">, </template>
      </template>
    </span>
  </div>
</template>

<script lang="ts" setup>
//core
import { defineProps, computed } from 'vue';
//utils
import aiplan from 'src/utils/aiplan';

const props = defineProps<{
  users: any[];
  currentUser?: any;
}>();

//computeds
const sortedUsers = computed(() => {
  if (!props.currentUser) return props.users;
  return [
    ...props.users.filter((u) => u.member?.id === props.currentUser?.id),
    ...props.users.filter((u) => u.member?.id !== props.currentUser?.id),
  ];
});
//methods
const getFullName = (member: any) => {
  return aiplan.UserName(member).join(' ') || 'Не Выбран';
};
</script>

<style scoped>
.selected-users-list {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  display: block;
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
