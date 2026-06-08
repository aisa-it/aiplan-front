<template>
  <q-menu
    ref="menuRef"
    :style="`z-index: ${isDialogOpen ? 6000 : 9001}`"
    v-bind="menuProps"
    touch-position
  >
    <q-list class="context-menu__options-list" separator>
      <q-item v-if="isArchive && canEditArchive" clickable @click="openConfirmation">
        <q-item-section thumbnail class="q-px-md">
          <ArchiveRemoveIcon />
        </q-item-section>
        <q-item-section>Разархивировать</q-item-section>
      </q-item>

      <q-item v-else-if="canEditArchive" clickable @click="openConfirmation">
        <q-item-section thumbnail class="q-px-md">
          <ArchiveAddIcon />
        </q-item-section>
        <q-item-section>В архив</q-item-section>
      </q-item>
    </q-list>
    <ConfirmArchiveDialog
      v-model="isDialogOpen"
      :project="props.row"
      :is-archive="isArchive"
      @success="successUnarchiveHandle"
      @error="errorUnarchiveHandle"
      @hide="menuRef.hide"
    />
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useNotificationStore } from 'src/stores/notification-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import ArchiveAddIcon from 'src/components/icons/ArchiveAddIcon.vue';
import ArchiveRemoveIcon from 'src/components/icons/ArchiveRemoveIcon.vue';
import {
  DtoProjectLight,
  DtoWorkspace,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import ConfirmArchiveDialog from 'src/components/dialogs/ConfirmArchiveDialog.vue';
import {
  ERROR_REMOVE_FROM_ARCHIVE,
  SUCCESS_REMOVE_FROM_ARCHIVE,
} from 'src/constants/notifications';
import { storeToRefs } from 'pinia';
const { hasPermissionByWorkspace } = useRolesStore();
const workspaceStore = useWorkspaceStore();

const { workspaceInfo } = storeToRefs(workspaceStore);

const props = defineProps<{
  row: DtoProjectLight;
  anchorEvent?: MouseEvent | null;
  isArchive?: boolean;
}>();

const menuRef = ref<any>(null);

const isControlled = computed(() => !!props.anchorEvent);

const canEditArchive = computed(() => hasPermissionByWorkspace(workspaceInfo?.value as DtoWorkspace, 'edit-archive'));

const menuProps = computed(() => {
  return isControlled.value ? {} : { 'context-menu': true };
});

const { setNotificationView } = useNotificationStore();

const isDialogOpen = ref<boolean>(false);

const openConfirmation = (): void => {
  isDialogOpen.value = true;
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const successUnarchiveHandle = () => {
  showNotification('success', SUCCESS_REMOVE_FROM_ARCHIVE);
};

const errorUnarchiveHandle = () => {
  showNotification('error', ERROR_REMOVE_FROM_ARCHIVE);
};

watch(
  () => props.anchorEvent,
  async (evt) => {
    if (evt && menuRef.value) {
      menuRef.value.hide();
      await nextTick();
      menuRef.value.show(evt);
    }
  },
);
</script>
