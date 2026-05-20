<template>
  <div
    class="row menu-link"
    :style="'width: 100%; display: flex; justify-content: space-between; align-items: center;'"
  >
    <q-item
      class="menu-link__item row items-center"
      tag="a"
      target="_self"
      :active="
        route.params.project === identifier || route.params.project === id
      "
      :to="hasPermissionByProject(project, 'show-project') ? link : ''"
    >
      <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
      </q-item-section>

      <q-item-section v-else-if="logo" avatar>
        <q-img
          :src="getUrlFile(logo)"
          :style="`width: 20px; height: 20px; border-radius: 4px; color: white;`"
        />
      </q-item-section>

      <q-item-section v-else-if="emoji" avatar>
        {{ String.fromCodePoint(parseInt(emoji?.value ?? emoji)) }}
      </q-item-section>

      <q-item-section v-else avatar>
        <AvatarImage
          :text="title[0].toUpperCase()"
          :tooltip="title"
          :rounded="false"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label class="abbriviated-text">{{ title }}</q-item-label>
        <HintTooltip
          anchor="bottom start"
          self="bottom start"
          :offset="[0, 42]"
        >
          {{ title }}</HintTooltip
        >
      </q-item-section>
      <q-space />

      <div style="display: flex; align-items: center">
        <MenuActions
          v-if="
            workspaceInfo && hasPermissionByWorkspace(workspaceInfo, 'show-project-popup')
          "
          :items="menuItems"
        />
      </div>
    </q-item>
  </div>
  <ConfirmArchiveDialog
    v-model="isUnarchiveDialogOpen"
    :project="projectToUnarchive"
    is-unarchive
    @success="successUnarchiveHandle"
    @error="errorUnarchiveHandle"
  />
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import AvatarImage from './AvatarImage.vue';
import ArchiveRemoveIcon from './icons/ArchiveRemoveIcon.vue';
import MenuActions from './menu/MenuActions.vue';

import { getUrlFile } from 'src/utils/helpers';
import { DtoProjectLight, DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import ConfirmArchiveDialog from 'src/components/dialogs/ConfirmArchiveDialog.vue';
import { ERROR_REMOVE_FROM_ARCHIVE, SUCCESS_REMOVE_FROM_ARCHIVE } from 'src/constants/notifications';

const props = withDefaults(
  defineProps<{
    id: string;
    emoji?: any;
    title: string;
    caption?: string;
    link?: string;
    icon?: string;
    favorite?: boolean;
    project?: any;
    workspaceSlug?: string;
    identifier?: string;
    logo?: string;
  }>(),
  {
    caption: () => '',
    link: () => '#',
    icon: () => '',
    workspaceSlug: () => '',
  },
);

// stores
const { hasPermissionByWorkspace, hasPermissionByProject } = useRolesStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// store to refs
const { workspaceInfo } = storeToRefs(workspaceStore);

const route = useRoute();

const projectToUnarchive = ref<DtoProjectLight | null>(null);
const isUnarchiveDialogOpen = ref(false);

// functions
const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const successUnarchiveHandle = async () => {
  projectToUnarchive.value = null;
  showNotification('success', SUCCESS_REMOVE_FROM_ARCHIVE);
};

const errorUnarchiveHandle = async () => {
  projectToUnarchive.value = null;
  showNotification('error', ERROR_REMOVE_FROM_ARCHIVE);
};

const menuItems = [{
    text: 'Разархивировать',
    icon: ArchiveRemoveIcon,
    onClick: () => {
      projectToUnarchive.value = props.project;
      isUnarchiveDialogOpen.value = true;
    },
    show: hasPermissionByWorkspace(workspaceInfo?.value as DtoWorkspace, 'edit-archive'),
  }];

</script>
<style lang="scss">
.right-icon {
  align-items: center;
  padding-top: 2px;
}
.menu-link__settings-btn > span.q-btn__content {
  display: flex !important;
  justify-content: flex-start !important;
}
</style>

<style scoped lang="scss">
.q-btn {
  background: none;
}
.favorite-btn--inactive {
  opacity: 0;

  @media (max-width: 768px) {
    opacity: 1;
  }
}
.menu-link:hover .favorite-btn--inactive {
  opacity: 1;
}
</style>
