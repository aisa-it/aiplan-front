<template>
  <ExpansionItem
    full-open
     :is-expanding="sprints.length > 0"
    itemName="sprints"
  >
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <SprintIcon :is-dark="$q.dark.isActive" />
        </q-item-section>
        <q-item-section>Спринты</q-item-section>
        <MenuActions
          v-if="headerMenuItems.length"
          :items="headerMenuItems"
          :flat="true"
          :dense="true"
          btnStyle="margin-right: 5px; padding: 4px 4px;"
        />
      </div>
    </template>
    <template v-slot:content>
      <q-tree
        :nodes="filteredSprints"
        node-key="id"
        label-key="name"
        children-key="sprints"
      >
        <template v-slot:default-header="prop">
          <q-item v-if="prop.node.stats"
            class="menu-link__item row items-center"
            style="padding-top: 0; padding-bottom: 0"
            tag="a"
            target="_self"
            :active="route.params.sprint === prop.node.id"
            :to="`/${currentWorkspaceSlug || workspaceInfo?.slug}/sprints/${
              prop.node.id
            }`"
          >
            <q-item-section avatar>
              <StatusCircularProgressBar
                style="width: 24px"
                :stats="prop.node.stats ?? {}"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="abbriviated-text">
                {{ prop.node.name }}
                {{
                  getSprintDates(prop.node?.start_date ?? '', prop.node?.end_date ?? '')
                }}
              </q-item-label>
              <HintTooltip
                anchor="bottom start"
                self="bottom start"
                :offset="[0, 42]"
              >
                {{ prop.node.name }}
              </HintTooltip>
            </q-item-section>
            <MenuActions
              v-if="hasPermission('show-sprint-popup')"
              :items="getSprintMenuItems(prop.node)"
            />
          </q-item>

          <q-item v-else
            class="menu-link__item row items-center"
            clickable
            @click="() => console.log(prop.node)"
          >
            <q-item-section avatar style="min-width: 0; padding-right: 8px">
              <q-icon
                name="folder"
                size="20px"
                :color="$q.dark.isActive ? 'grey-7' : 'grey-4'"
              />
            </q-item-section>
            <q-item-section class="tree-custom-header__name" style="font-weight: 500">
              {{ prop.node.name }}
            </q-item-section>
            <MenuActions
              v-if="hasPermission('show-sprint-popup') && getFolderMenuItems(prop.node)"
              :items="getFolderMenuItems(prop.node)"
            />
          </q-item>
        </template>
      </q-tree>
      <CreateFolderDialog
        v-model="openCreateFolder"
        @success="refreshSprints"
      />
      <DeleteFolderDialog
        v-model="openDeleteFolder"
        :folder-id="folderIdForDelete"
        @success="successDeleteHandle('folder')"
      />
      <EditFolderDialog
        v-model="openEditFolder"
        :sprint="sprintIdForManageFolder"
        @update-sprints="refreshSprints"
        @reopen="reopen"
      />
      <CreateSprintDialog
        v-model="openCreateSprint"
        @update-sprints="refreshSprints"
        @reopen="reopen"
      />
      <CreateSprintDialog
        v-model="openEditSprint"
        :sprint-id="sprintIdForEdit"
        @update-sprints="refreshSprints"
      />
      <DeleteSprintDialog
        v-model="isDeleteDialogOpen"
        :sprint="sprintForDelete"
        @success="successDeleteHandle('sprint')"
      />
      <SprintNotificationsSettingsDialog v-model="openSprintNotifications" />
      <ManageSprintFolderDialog
        v-if="openManageFolderSprint"
        v-model="openManageFolderSprint"
        :sprint-id="sprintIdForManageFolder"
        @success="refreshSprints"
      />
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { QIcon, useQuasar } from 'quasar';

import { storeToRefs } from 'pinia';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useNotificationStore } from 'src/stores/notification-store';

import ExpansionItem from '../ExpansionItem.vue';
import SprintIcon from '../icons/SprintIcon.vue';
import StatusCircularProgressBar from '../progress-bars/StatusCircularProgressBar.vue';
import CreateSprintDialog from 'src/modules/sprints/create-sprint-dialog/CreateSprintDialog.vue';
import DeleteSprintDialog from 'src/modules/sprints/delete-sprint-dialog/DeleteSprintDialog.vue';
import SprintNotificationsSettingsDialog from 'src/modules/sprints/notifications-dialog/SprintNotificationsSettingsDialog.vue';
import ManageSprintFolderDialog from 'src/modules/sprints/manage-sprint-folder-dialog/ManageSprintFolderDialog.vue';

import { DtoSprint, DtoSprintFolder, DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import SettingsIcon from '../icons/SettingsIcon.vue';
import BinIcon from '../icons/BinIcon.vue';
import { getSprintDates } from 'src/modules/sprints/helpres';
import LinkIcon from '../icons/LinkIcon.vue';
import MenuActions from './MenuActions.vue';
import BellIcon from '../icons/BellIcon.vue';
import AddIcon from '../icons/AddIcon.vue';
import FolderIcon from '../icons/FolderIcon.vue';
import CreateFolderDialog from 'src/modules/sprints/create-folder-dialog/CreateFolderDialog.vue';
import DeleteFolderDialog from 'src/modules/sprints/delete-folder-dialog/DeleteFolderDialog.vue';
import EditFolderDialog from 'src/modules/sprints/edit-folder-dialog/EditFolderDialog.vue';
import { ROOT_FOLDER_ID } from 'src/constants/constants';

const $q = useQuasar();
const workspaceStore = useWorkspaceStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();
const { hasPermission } = useRolesStore();

const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);

const route = useRoute();
const sprints = ref([] as DtoSprintFolder[]);
const openCreateSprint = ref(false);
const openCreateFolder = ref(false);
const openDeleteFolder = ref(false);
const openEditFolder = ref(false);
const openEditSprint = ref(false);
const sprintIdForEdit = ref<string>('');
const folderIdForDelete = ref<string>('');
const sprintIdForManageFolder = ref<DtoSprintLight>();
const openManageFolderSprint = ref(false);
const sprintForDelete = ref<DtoSprintLight | null>(null);
const isDeleteDialogOpen = ref(false);
const openSprintNotifications = ref(false);
const canCreateSprint = computed(() => hasPermission('create-sprint'));
const canCreateSprintFolder = computed(() => hasPermission('edit-sprint-folders'));
const canDeleteSprintFolder = computed(() => hasPermission('edit-sprint-folders'));

const sprintFolders = computed(() =>
  sprints.value?.filter((item) => item.id !== ROOT_FOLDER_ID)
  // sprints.value
);
const rootSprints = computed(() =>
  sprints.value?.find((item) => item.id === ROOT_FOLDER_ID)?.sprints
);
const filteredSprints = computed(() => {
  let items = [];
  console.log('sprintFolders: ', sprintFolders.value)
  if (sprintFolders.value) {
    items.push(...sprintFolders.value)
  }
  console.log('rootSprints: ', rootSprints.value)
  if (rootSprints.value) {
    items.push(...rootSprints.value);
  }
  return items;
});

const refreshSprints = async () => {
  sprints.value = await sprintStore.getSprintsList(
    currentWorkspaceSlug.value as string,
  );
};

const reopen = async (id: string) => {
  await refreshSprints();
  sprintIdForEdit.value = id as string;
  openEditSprint.value = true;
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const successDeleteHandle = async (item: string) => {
  switch (item) {
    case 'sprint':
      sprintForDelete.value = null;
      showNotification('success', 'Спринт удален');
      break;
    case 'folder':
      folderIdForDelete.value = '';
      showNotification('success', 'Папка удалена');
      break;
  }
  await refreshSprints();
};

const getSprintMenuItems = (sprint: DtoSprintLight) => {
  const items: any[] = [
    {
      text: 'Настройки',
      icon: SettingsIcon,
      onClick: () => {
        sprintIdForEdit.value = sprint.id as string;
        openEditSprint.value = true;
      },
    },
    {
      text: 'Скопировать ссылку',
      icon: LinkIcon,
      onClick: () => sprintStore.sprintLinkToClipboard(String(sprint.id)),
    },
    {
      text: 'Удалить спринт',
      icon: BinIcon,
      onClick: () => {
        sprintForDelete.value = sprint ?? null;
        isDeleteDialogOpen.value = true;
      },
    },
  ];

  if (hasPermission('edit-sprint-folders')) {
    items.unshift({
      text: 'Добавить к папке...',
      icon: FolderIcon,
      onClick: () => {
        sprintIdForManageFolder.value = sprint;
        openEditFolder.value = true;
      },
    });
  }

  return items;
};

const getFolderMenuItems = (folder: DtoSprintFolder) => {
  if (!folder.sprints || folder.sprints?.length === 0) {
    return [{
      text: 'Удалить папку',
      icon: BinIcon,
      onClick: () => {
        folderIdForDelete.value = folder.id as string;
        openDeleteFolder.value = true;
      },
      show: canDeleteSprintFolder.value,
    },]
  } else return;
};

const headerMenuItems = computed(() => ([
  {
    text: 'Создать папку',
    icon: AddIcon as any,
    onClick: () => {
      openCreateFolder.value = true;
    },
    show: canCreateSprintFolder.value,
  },
  {
    text: 'Создать спринт',
    icon: AddIcon as any,
    onClick: () => {
      openCreateSprint.value = true;
    },
    show: canCreateSprint.value,
  },
  {
    text: 'Настроить уведомления',
    icon: BellIcon as any,
    onClick: () => {
      openSprintNotifications.value = true;
    },
  },
]));

onMounted(async () => {
  if (!currentWorkspaceSlug.value) return;
  refreshSprints();
});

watch(currentWorkspaceSlug, async (newValue) => {
  if (!newValue) return;
  sprints.value = await sprintStore.getSprintsList(newValue as string);
});

watch(
  () => sprintStore.refreshSprintData,
  async (v) => {
    if (v) {
      await refreshSprints();
      sprintStore.clearSprintRefresh();
    }
  },
);

watch(
  () => sprintStore.sprintsList,
  () => {
    sprints.value = sprintStore.sprintsList;
  }
)
</script>
<style scoped lang="scss">
 :deep(.q-tree__node--child) {
  padding-left: 0;

  &::before {
    content: none;
    display: none;
  }
 }
</style>
