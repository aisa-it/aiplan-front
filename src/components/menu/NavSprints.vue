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
      <q-list
        v-if="sprints.length > 0"
        :style="{
          overflow: 'scroll',
        }"
        class="scrollable-content"
      >
        <q-expansion-item
          v-for="folder in parsedSprints.folders"
          :key="folder.id"
          class="q-list--sprint-folder q-mb-sm"
          dense
          dense-toggle
        >
          <template v-slot:header>
            <q-item-section avatar style="min-width: 0; padding-right: 8px">
              <q-icon
                name="folder"
                size="20px"
                :color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
              />
            </q-item-section>
            <q-item-section class="text-subtitle2" style="font-weight: 500">
              {{ folder.name }}
            </q-item-section>
          </template>

          <q-item
            v-for="sprint in folder.items"
            :key="sprint.id"
            class="menu-link__item row items-center q-pl-xl"
            style="padding-top: 0; padding-bottom: 0"
            tag="a"
            target="_self"
            :active="route.params.sprint === sprint.id"
            :to="`/${currentWorkspaceSlug || workspaceInfo?.slug}/sprints/${
              sprint.id
            }`"
          >
            <q-item-section avatar>
              <StatusCircularProgressBar
                style="width: 24px"
                :stats="sprint.stats ?? {}"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="abbriviated-text">
                {{ sprint.name }}
                {{
                  getSprintDates(
                    sprint?.start_date ?? '',
                    sprint?.end_date ?? '',
                  )
                }}
              </q-item-label>
              <HintTooltip
                anchor="bottom start"
                self="bottom start"
                :offset="[0, 42]"
              >
                {{ sprint.name }}
              </HintTooltip>
            </q-item-section>
            <MenuActions
              v-if="hasPermission('show-sprint-popup')"
              :items="getSprintMenuItems(sprint)"
            />
          </q-item>
        </q-expansion-item>

        <q-item
          v-for="sprint in parsedSprints.root"
          :key="sprint.id"
          class="menu-link__item row items-center"
          style="padding-top: 0; padding-bottom: 0"
          tag="a"
          target="_self"
          :active="route.params.sprint === sprint.id"
          :to="`/${currentWorkspaceSlug || workspaceInfo?.slug}/sprints/${
            sprint.id
          }`"
        >
          <q-item-section avatar>
            <StatusCircularProgressBar
              style="width: 24px"
              :stats="sprint.stats ?? {}"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="abbriviated-text">
              {{ sprint.name }}
              {{
                getSprintDates(sprint?.start_date ?? '', sprint?.end_date ?? '')
              }}
            </q-item-label>
            <HintTooltip
              anchor="bottom start"
              self="bottom start"
              :offset="[0, 42]"
            >
              {{ sprint.name }}
            </HintTooltip>
          </q-item-section>
          <MenuActions
            v-if="hasPermission('show-sprint-popup')"
            :items="getSprintMenuItems(sprint)"
          />
        </q-item>
      </q-list>
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
        @success="successDeleteHandle"
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

import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import SettingsIcon from '../icons/SettingsIcon.vue';
import BinIcon from '../icons/BinIcon.vue';
import { getSprintDates } from 'src/modules/sprints/helpres';
import LinkIcon from '../icons/LinkIcon.vue';
import MenuActions from './MenuActions.vue';
import BellIcon from '../icons/BellIcon.vue';
import AddIcon from '../icons/AddIcon.vue';
import FolderIcon from '../icons/FolderIcon.vue';

const $q = useQuasar();
const workspaceStore = useWorkspaceStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();
const { hasPermission } = useRolesStore();

const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { sprintFolders } = storeToRefs(sprintStore);

const route = useRoute();
const sprints = ref([] as DtoSprintLight[]);

const parsedSprints = computed(() => {
  const result = {
    root: [] as DtoSprintLight[],
    folders: [] as { id: string; name: string; items: DtoSprintLight[] }[],
  };

  const foldersMap: Record<
    string,
    { id: string; name: string; items: DtoSprintLight[] }
  > = {};
  sprintFolders.value.forEach((folder) => {
    foldersMap[folder.id] = { id: folder.id, name: folder.name, items: [] };
  });

  sprints.value.forEach((sprint) => {
    const folderId = sprintFolders.value.find((f) =>
      f.sprints.includes(sprint.id as string),
    )?.id;
    if (folderId && foldersMap[folderId]) {
      foldersMap[folderId].items.push(sprint);
    } else {
      result.root.push(sprint);
    }
  });

  result.folders = Object.values(foldersMap);
  return result;
});

const openCreateSprint = ref(false);
const openEditSprint = ref(false);
const sprintIdForEdit = ref<string>('');
const sprintIdForManageFolder = ref<string>('');
const openManageFolderSprint = ref(false);
const sprintForDelete = ref<DtoSprintLight | null>(null);
const isDeleteDialogOpen = ref(false);
const openSprintNotifications = ref(false);
const canCreateSprint = computed(() => hasPermission('create-sprint'));

onMounted(async () => {
  if (!currentWorkspaceSlug.value) return;
  refreshSprints();
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

const successDeleteHandle = async () => {
  sprintForDelete.value = null;
  showNotification('success', 'Спринт удален');
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

  if (hasPermission('create-sprint')) {
    items.unshift({
      text: 'Добавить к папке...',
      icon: FolderIcon,
      onClick: () => {
        sprintIdForManageFolder.value = sprint.id as string;
        openManageFolderSprint.value = true;
      },
    });
  }

  return items;
};

const headerMenuItems = computed(() => [
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
]);

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
</script>
