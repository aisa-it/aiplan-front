<template>
  <q-menu
    ref="menuRef"
    class="context-menu"
    :style="`z-index: ${ isDeletingOpen || isRenamingOpen ? 6000 : 9001}`"
    v-bind="menuProps"
    touch-position
  >
    <q-list class="context-menu__options-list" separator>
      <q-item
        v-if="canEditSprintFolder"
        clickable
        @click="renameFolder"
      >
        <q-item-section thumbnail class="q-px-md">
          <EditIcon />
        </q-item-section>
        <q-item-section>Переименовать папку</q-item-section>
      </q-item>
      <q-item
        v-if="canDeleteSprintFolder"
        class="context-menu__options-item_red"
        clickable
        @click="deleteFolder"
      >
        <q-item-section thumbnail class="q-px-md">
          <BinIcon color="#cd5c5c" />
        </q-item-section>
        <q-item-section>Удалить папку</q-item-section>
      </q-item>
    </q-list>
    <RenameFolderDialog
      v-if="folderId"
      v-model="isRenamingOpen"
      :folder-id="folderId"
      :folder-name="folderName"
      @success="refreshSprints"
      @hide-menu="menuRef.hide()"
    />
    <DeleteFolderDialog
      v-if="folderId"
      v-model="isDeletingOpen"
      :folder-id="folderId"
      :folder-name="folderName"
      @success="refreshSprints"
      @hide-menu="menuRef.hide"
    />
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';

import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import DeleteFolderDialog from 'src/modules/sprints/delete-folder-dialog/DeleteFolderDialog.vue';
import RenameFolderDialog from 'src/modules/sprints/rename-folder-dialog/RenameFolderDialog.vue';

const sprintStore = useSprintStore();
const workspaceStore = useWorkspaceStore();
const { hasPermissionByWorkspace } = useRolesStore();

const props = defineProps<{
  folderId: string | undefined;
  folderName: string;
  anchorEvent?: MouseEvent | null;
}>();

const menuRef = ref<any>(null);

const isControlled = computed(() => !!props.anchorEvent);

const menuProps = computed(() => {
  return isControlled.value ? {} : { 'context-menu': true };
});

const isDeletingOpen = ref<boolean>(false);
const isRenamingOpen = ref<boolean>(false);

const canEditSprintFolder = computed(() =>
  hasPermissionByWorkspace(workspaceStore.workspaceInfo as DtoWorkspace, 'edit-sprint-folders')
);

const canDeleteSprintFolder = computed(() =>
  hasPermissionByWorkspace(workspaceStore.workspaceInfo as DtoWorkspace, 'edit-sprint-folders')
);

const deleteFolder = (): void => {
  isDeletingOpen.value = true;
};

const renameFolder = (): void => {
  isRenamingOpen.value = true;
}

const refreshSprints = async () => {
  await sprintStore.getSprintsList(
    workspaceStore.currentWorkspaceSlug as string,
  );
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

<style lang="scss" scoped>
.context-menu {
  &__options-item {
    &_red {
      color: red;
    }
  }

  &__options-item_red {
    > .q-item__section {
      color: #cd5c5c !important;
    }

    &:hover > .q-item__section {
      color: red !important;
      ::v-deep(svg path) {
        fill: red !important;
      }
    }
  }
}
</style>
