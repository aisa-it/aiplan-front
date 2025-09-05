<template>
  <AdminHeader title="Пользователи">
    <SearchInput v-model="searchQuery" />
  </AdminHeader>

  <UserTable
    ref="userTable"
    @open-block-dialog="openBlockDialog"
    @success-update-user="onSuccess"
    :search-query="searchQuery"
  />

  <BlockUserDialog
    v-model="isBlockDialogShow"
    :user="currentUser"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useNotificationStore } from 'src/stores/notification-store';

import BlockUserDialog from '../dialogs/BlockUserDialog.vue';
import AdminHeader from '../ui/AdminHeader.vue';
import UserTable from './components/UserTable.vue';
import SearchInput from 'src/components/SearchInput.vue';

import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';
import { useBlockDialog } from './composables/useBlockDialog';

const searchQuery = ref<string | undefined>();

const userTable = ref();
const { setNotificationView } = useNotificationStore();

const { isBlockDialogShow, currentUser, openBlockDialog } = useBlockDialog();

async function onSuccess() {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_UPDATE_DATA,
  });
  userTable.value.refresh();
}
</script>
