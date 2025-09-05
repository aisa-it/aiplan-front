<template>
  <SelectNotificationRecipients
    v-model:recipients="innerRecipients"
    :options="users.result"
    :is-role-ignored="true"
    :use-async-search="true"
    :is-loading="loading"
    @fetchMembers="getMembers"
    @asyncSearch="handleSearchMembers"
    @resetPagination="resetPagination"
    class="admin-notification__section_select"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSelectMembers } from '../composables/useSelectMembers';

import SelectNotificationRecipients from 'src/components/dialogs/WorkspaceNotificationDialog/SelectNotificationRecipients.vue';

const props = defineProps<{
  members: string[] | undefined;
}>();

const emit = defineEmits<{
  'update:members': [value: string[] | undefined];
}>();

const innerRecipients = computed({
  get: () => props.members,
  set: (value) => emit('update:members', value),
});

const { loading, users, getMembers, handleSearchMembers, resetPagination } =
  useSelectMembers();
</script>

<style scoped lang="scss">
.admin-notification__section_select {
  width: 336px;
  @media (max-width: 768px) {
    width: 100%;
  }
}
</style>
