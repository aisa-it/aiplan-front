<template>
  <q-dialog ref="dialogRef" @hide="handleClose">
    <q-card
      class="modal-card"
      :class="isDesktop ? 'q-pa-lg' : 'q-pa-md'"
      :style="{ 'overflow: auto;': !isDesktop }"
      container
    >
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Добавить спринт {{ sprint?.name }} к папке:</h6>
        <div v-if="!loading && sprintFolders.length > 0">
          <q-list>
            <q-item
              v-for="folder in foldersForRename"
              :key="folder?.id"
              clickable
            >
              <q-item-section
                class="no-wrap centered-horisontally"
                :active="
                  !!folder?.sprints?.find((item) => item.id === sprint.id)
                "
              >
                <q-radio
                  dense
                  v-model="selectedFolderId"
                  :val="folder.id"
                  :class="{ 'full-w': folderIdForEdit !== folder?.id }"
                >
                  <span
                    v-if="folderIdForEdit !== folder?.id"
                    class="full-w centered-horisontally"
                  >
                    {{ folder?.name }}
                  </span>
                </q-radio>
                <q-input
                  v-if="folderIdForEdit === folder?.id"
                  v-model="folder.name"
                  class="base-textarea full-w"
                  dense
                  autogrow
                  autofocus
                  hide-bottom-space
                  :rules="[
                    (val) =>
                      (val.trim() && val.trim().length > 0) ||
                      'Необходимо ввести название',
                  ]"
                  @click.stop
                  @touchstart.stop
                >
                  <template v-slot:append> </template>
                </q-input>
                <q-btn
                  flat
                  dense
                  @click="
                    () => {
                      folderIdForEdit = folder?.id as string;
                    }
                  "
                >
                  <EditIcon :width="16" :height="16"></EditIcon>
                  <HintTooltip>Переименовать папку</HintTooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  :disable="!!folder?.sprints && folder.sprints.length !== 0"
                  @click="
                    () => {
                      folderIdForDelete = folder?.id as string;
                      openDeleteFolder = true;
                    }
                  "
                >
                  <HintTooltip
                    v-if="!folder?.sprints || folder.sprints.length === 0"
                    >Удалить папку</HintTooltip
                  >
                  <HintTooltip v-else
                    >Удалить можно только пустую папку</HintTooltip
                  >

                  <BinIcon color="#DC3E3E" :width="16" :height="16"></BinIcon>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-radio
                dense
                v-model="selectedFolderId"
                :val="ROOT_FOLDER_ID"
                class="full-w"
                color="grey-7"
              >
                <span class="full-w centered-horisontally"> Без папки </span>
              </q-radio>
            </q-item>
          </q-list>
        </div>
        <div
          v-if="loading || (!loading && sprintFolders.length == 0)"
          class="column justify-center"
          style="height: 90%"
        >
          <DefaultLoader
            v-if="loading"
            class="self-center"
            :size="2"
            unit="em"
          />
        </div>
        <q-list>
          <q-item clickable>
            <q-btn
              class="menu-link__settings-btn full-w q-pa-none"
              flat
              dense
              no-caps
              @click="
                () => {
                  openCreateFolder = true;
                }
              "
            >
              <AddIcon
                :width="20"
                :height="20"
                class="q-mr-sm"
                :view-box="'2 2 20 20'"
              />
              <span>Создать папку</span>
            </q-btn>
          </q-item>
        </q-list>
        <CreateFolderDialog
          v-model="openCreateFolder"
          @success="refreshSprints"
        />
        <DeleteFolderDialog
          v-model="openDeleteFolder"
          :folder-id="folderIdForDelete"
          @success="successDeleteHandle"
        />
      </q-card-section>
      <q-card-actions align="right">
        <SaveButton v-close-popup style="width: 110px" @click="handleSave" />
        <CancelButton
          v-close-popup
          style="width: 110px"
          @click="resetFoldersForEdition"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, useQuasar } from 'quasar';
import { computed, onMounted, ref, watch } from 'vue';

import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import AddIcon from 'src/components/icons/AddIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import DeleteFolderDialog from 'src/modules/sprints/delete-folder-dialog/DeleteFolderDialog.vue';
import CreateFolderDialog from 'src/modules/sprints/create-folder-dialog/CreateFolderDialog.vue';
import CancelButton from 'src/components/buttons/CancelButton.vue';
import SaveButton from 'src/components/buttons/SaveButton.vue';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useSprintStore } from '../stores/sprint-store';

import {
  DtoRequestSprintFolder,
  DtoSprintFolder,
  DtoSprintLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { ROOT_FOLDER_ID } from 'src/constants/constants';
import {
  sprintUpdate,
  updateSprintFolder,
} from 'src/modules/sprints/services/api';

const props = defineProps<{
  sprint: DtoSprintLight;
}>();

const q = useQuasar();

const isDesktop = computed(() => q.platform.is?.desktop);

interface FolderForRename extends DtoSprintFolder {
  oldName?: string;
}

const openCreateFolder = ref(false);
const openDeleteFolder = ref(false);
const folderIdForDelete = ref<string>('');
const folderIdForEdit = ref<string>('');

const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const sprintStore = useSprintStore();

const sprints = ref([] as DtoSprintFolder[]);
const loading = ref(false);

const sprintFolders = computed(() =>
  sprints.value?.filter((item) => item.id !== ROOT_FOLDER_ID),
);

const foldersForRename = ref<FolderForRename[]>(
  sprintFolders.value.map((folder) => ({
    id: folder.id as string,
    name: folder.name as string,
    oldName: folder.name as string,
    sprints: folder.sprints || [],
  })),
);

const defaultFolderId = computed(() => {
  return sprints.value.find((folder) =>
    folder.sprints?.some((sprint) => sprint.id === props.sprint?.id),
  )?.id;
});

const selectedFolderId = ref<string | undefined>(defaultFolderId.value);

const handleClose = () => {
  folderIdForEdit.value = '';
  refreshSprints();
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const resetFoldersForEdition = () => {
  if (selectedFolderId.value) {
    selectedFolderId.value = defaultFolderId.value;
  }
  if (folderIdForEdit.value) {
    folderIdForEdit.value = '';
  }
  if (folderIdForDelete.value) {
    folderIdForDelete.value = '';
  }
};

const successDeleteHandle = async () => {
  resetFoldersForEdition();
  showNotification('success', 'Папка удалена');
  await refreshSprints();
};

const refreshSprints = async () => {
  sprints.value = await sprintStore.getSprintsList(
    workspaceStore.currentWorkspaceSlug as string,
  );
};

const transferSprintHandle = async (newFolderId: string) => {
  const data = {
    sprint_folder_id: newFolderId,
  };

  try {
    await sprintUpdate(
      workspaceStore.currentWorkspaceSlug ?? '',
      props.sprint.id ?? '',
      data,
    );
  } catch {
    showNotification('error', 'Ошибка при переносе спринта');
    return;
  }
  showNotification('success', 'Спринт добавлен в папку');
};

const renameFolderHandle = async (folder: FolderForRename) => {
  if (folder.name !== folder.oldName) {
    const data: DtoRequestSprintFolder = {
      name: folder.name,
    };
    try {
      await updateSprintFolder(
        workspaceStore.currentWorkspaceSlug || '',
        folder.id as string,
        data,
      );
    } catch {
      showNotification('error', 'Ошибка переименования папки');
      return;
    }
    const successMessage = `Имя папки "${folder.oldName}" изменено на "${folder.name}"`;
    showNotification('success', successMessage);
    resetFoldersForEdition();
    await refreshSprints();
  }
};

const handleSave = async () => {
  // Перемещение в/из папки
  if (selectedFolderId.value !== defaultFolderId.value) {
    await transferSprintHandle(selectedFolderId.value as string);
    selectedFolderId.value = defaultFolderId.value;
  }

  // Переименование
  foldersForRename.value.forEach((folder) => renameFolderHandle(folder));

  if (folderIdForEdit.value) {
    folderIdForEdit.value = '';
  }
};

onMounted(async () => {
  if (!workspaceStore.currentWorkspaceSlug) return;
  refreshSprints();
});

watch(
  () => sprintStore.sprintsList,
  () => {
    sprints.value = sprintStore.sprintsList;
  },
);

watch(
  () => workspaceStore.currentWorkspaceSlug,
  () => {
    refreshSprints();
  },
);

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
  () => defaultFolderId.value,
  () => (selectedFolderId.value = defaultFolderId.value),
);

watch(
  () => sprintFolders.value,
  () =>
    (foldersForRename.value = sprintFolders.value.map((folder) => ({
      id: folder.id as string,
      name: folder.name as string,
      oldName: folder.name as string,
      sprints: folder.sprints || [],
    }))),
);
</script>

<style scoped lang="scss">
:deep(.q-radio--dense .q-radio__label) {
  padding-left: 8px;
}

:deep(.q-card__section--vert) {
  padding-left: 0;
  padding-top: 0;
  padding-right: 0;
}
</style>
