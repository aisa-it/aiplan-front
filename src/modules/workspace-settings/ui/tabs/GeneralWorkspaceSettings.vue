<template>
  <div class="row mobile-block">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Аватар</h4>
      <p class="text-sm text-brand-secondary">
        Поддерживается .jpg, .png и .gif
      </p>
    </div>
    <div class="col">
      <div class="row" style="align-items: center; margin-top: 0.45em">
        <div>
          <q-img
            v-if="isWorkspaceLogo"
            :src="`${
              workspaceInfoForm?.logo ? getUrlFile(workspaceInfoForm.logo) : ''
            }`"
            :style="`width: 48px; height: 48px; border-radius: 4px; color: white;`"
            @error="handleAvatarError"
          >
            <template #error>
              <div class="none-avatar text-avatar body-2">
                {{ getFirstSymbol(computedWorkspaceInfo?.name) }}
              </div>
            </template>
          </q-img>
          <div
            v-else
            style="width: 48px; height: 48px; border-radius: 4px"
            class="none-avatar text-avatar body-2"
          >
            {{ getFirstSymbol(computedWorkspaceInfo?.name) }}
          </div>
        </div>
        <div v-if="canEdit" class="q-ml-sm">
          <q-btn
            class="secondary-btn"
            no-caps
            @click="isUploaderOpen = !isUploaderOpen"
          >
            Загрузить
          </q-btn>
          <q-btn
            v-if="isWorkspaceLogo && !isAvatarError"
            no-caps
            class="delete-btn q-mx-xs"
            @click="handleDeleteWorkspaceAvatar"
          >
            Удалить
          </q-btn>
        </div>
      </div>
    </div>
  </div>

  <div
    class="row items-baseline mobile-block q-mt-md"
    style="margin-bottom: 32px"
  >
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Лидер пространства</h4>
      <p class="text-sm text-brand-secondary q-mb-none">
        Выберите лидера пространства
      </p>
    </div>
    <div class="col row items-baseline">
      <AvatarImage
        :key="computedWorkspaceInfo.owner.id"
        size="35px"
        :prefix="'Лидер'"
        class="issue-panel-avatar self-end"
        :tooltip="avatarText(computedWorkspaceInfo.owner).join(' ')"
        :text="
          [
            avatarText(computedWorkspaceInfo.owner)[0]?.at(0),
            avatarText(computedWorkspaceInfo.owner)[1]?.at(0),
          ].join(' ')
        "
        :image="computedWorkspaceInfo.owner.avatar_id"
        :member="computedWorkspaceInfo.owner"
        @click.stop="
          $router.push({
            path: `/${computedWorkspaceInfo.slug}/user-activities/${computedWorkspaceInfo.owner.id}`,
          })
        "
      />
      <span class="q-ml-sm owner-name self-middle">
        {{ aiplan.UserName(computedWorkspaceInfo.owner).join(' ') }}
      </span>
      <q-btn
        @click="isSelectLeadOpen = true"
        :disable="
          !hasPermissionByWorkspace(computedWorkspaceInfo, 'change-lead-ws')
        "
        class="q-ml-xs self-middle"
        dense
        flat
        no-caps
        no-wrap
      >
        <EditIcon :width="20" :height="20" />
      </q-btn>
    </div>
  </div>

  <div class="row mobile-block">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Имя</h4>
      <p class="text-sm text-brand-secondary">Имя рабочего пространства</p>
    </div>
    <div class="col">
      <q-input
        class="base-input"
        dense
        data-id="workspace-name-settings"
        v-model="workspaceInfoForm.name"
        label="Имя рабочего пространства"
        :rules="[validateName]"
        :disable="!canEdit"
        style="margin: 0.375em 0"
      />
    </div>
  </div>

  <div class="row mobile-block q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Описание</h4>
      <p class="text-sm text-brand-secondary">Описание рабочего пространства</p>
    </div>
    <div class="col">
      <EditorTipTapV2
        editor-id="workspace-editor"
        v-model="workspaceInfoForm.description"
        :disableImages="true"
        :can-edit="canEdit"
        class="issue-panel__editor"
        style="margin: 0.375em 0"
        canResize
        isFullScreenView
        @updateEditorDOM="updateEditorDOM"
        @get-editor="getEditor"
        @toggle-fullscreen="toggleFullscreen"
        :excluded-tabs="[TIPTAP_TABS.drawio]"
      />
    </div>
  </div>

  <div class="row mobile-block q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">URL</h4>
      <p class="text-sm text-brand-secondary">URL рабочего пространства</p>
    </div>
    <div class="col">
      <q-input
        class="base-input"
        dense
        prefix="https://aiplan.aisa.ru/"
        v-model="workspaceInfoForm.slug"
        disable
        style="margin: 0.375em 0"
      />
    </div>
  </div>

  <div class="row mobile-block q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Токен</h4>
      <p class="text-sm text-brand-secondary">Токен для работы интеграций</p>
    </div>
    <div class="col">
      <q-input
        v-model="workspaceToken"
        class="base-input"
        dense
        readonly
        :type="isToken ? 'password' : 'text'"
        style="margin: 0.375em 0"
      >
        <template v-slot:append>
          <q-icon
            :name="isToken ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isToken = !isToken"
          />
        </template>

        <template v-slot:after>
          <q-btn
            v-if="canEdit"
            data-id="workspace-token-reset-settings"
            class="delete-btn q-mr-sm"
            icon="lock_reset"
            @click="handleResetWsToken"
          />
          <q-btn
            data-id="copy-token-settings"
            class="secondary-btn-only-icon"
            icon="content_copy"
            @click="handleCopyWorkspaceToken"
          />
        </template>
      </q-input>
    </div>
  </div>

  <q-card-actions v-if="canEdit" align="right">
    <q-btn
      no-caps
      data-id="workspace-save-settings"
      class="secondary-btn"
      :disable="!isValidName"
      @click="handleUpdateWorkspace"
    >
      Сохранить
    </q-btn>
  </q-card-actions>
  <q-dialog
    v-model="isFullscreen"
    @show="updateEditorValueDialog"
    @hide="updateEditorValue"
  >
    <q-card
      class="fullscreen-dialog row"
      :class="[isMobile ? 'q-pr-xs' : 'q-pa-xs']"
    >
      <EditorTipTapV2
        editor-id="workspace-editor-dialog"
        v-model="editorValueDialog"
        :disableImages="true"
        :can-edit="canEdit"
        style="border: none; height: 100%"
        @toggle-fullscreen="toggleFullscreen"
        @updateEditorDOM="updateEditorDOM"
        @get-editor="getEditor"
        isFullScreen
        isFullScreenView
        :excluded-tabs="[TIPTAP_TABS.drawio]"
      /> </q-card
  ></q-dialog>
  <!-- <div>
      <h3>Восстановление</h3>
      <div class="row mobile-block q-mt-md">
        <div class="col">
          <h4 class="text-lg font-semibold text-brand-base">Экспорт</h4>
          <p class="text-sm text-brand-secondary">
            Получение копии текущего состояния пространства.
          </p>
        </div>
        <div class="col">
          <q-card-actions align="right">
            <q-btn
              no-caps
              class="secondary-btn"
              style="width: 80px"
              @click="downloadBackup"
              :disable="isDemo"
            >
              Экспорт
            </q-btn>
          </q-card-actions>
        </div>
      </div>

      <div class="row mobile-block q-mt-md">
        <div class="col">
          <h4 class="text-lg font-semibold text-brand-base">Импорт</h4>
          <p class="text-sm text-brand-secondary">
            Восстановление рабочего пространства из копии
          </p>
        </div>
        <div class="col">
          <q-card-actions align="right">
            <q-btn
              no-caps
              class="secondary-btn"
              style="width: 80px"
              :disable="isDemo"
              @click="
                () => {
                  handleOpenImport();
                }
              "
            >
              Импорт
            </q-btn>
          </q-card-actions>
        </div>
      </div>
    </div> -->

  <div v-if="hasPermission('delete-ws')">
    <div class="row mobile-block q-mt-md" :style="'align-items: end;'">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">
          Удалить пространство
        </h4>
        <p class="text-sm text-brand-secondary">
          Пространство будет удалено безвозвратно
        </p>
      </div>
      <div class="col q-mb-md">
        <q-card-actions align="right">
          <q-btn
            no-caps
            data-id="workspace-delete-settings"
            class="delete-btn"
            @click="isDeleteOpen = !isDeleteOpen"
          >
            Удалить пространство
          </q-btn>
        </q-card-actions>
      </div>
    </div>
  </div>
  <ImportDialog
    v-if="!isDemo"
    v-model="isImportOpen"
    :workspaceSlug="workspaceInfoForm?.slug ?? ''"
    @success="onSuccess"
  />
  <DeleteWorkspaceModal
    v-model="isDeleteOpen"
    :currentWorkspace="workspaceInfoForm"
    :is-in-admin-panel="props.isInAdminPanel"
  />
  <UploadWorkspaceAvatarDialog
    v-model="isUploaderOpen"
    :currentWorkspace="workspaceInfoForm"
    @success="onSuccess(SUCCESS_CREATE_IMG_WS)"
    @update="refreshInfo"
  />
  <q-dialog
    v-model="isSelectLeadOpen"
    @show="oldLeadWs = workspaceInfoForm.owner_id"
    @hide="workspaceInfoForm.owner_id = oldLeadWs"
  >
    <div class="dialog-select-leader">
      <SelectLeader
        v-model:current-value="workspaceInfoForm.owner_id"
        :options="leadWorkspaceOptions"
        label="Лидер пространства"
        style="margin: 0.375em 0; width: 100%"
        :is-disabled="
          !hasPermissionByWorkspace(computedWorkspaceInfo, 'change-lead-ws')
        "
      />
      <div
        class="q-mt-xs"
        style="display: flex; justify-content: right; width: 100%"
      >
        <q-btn
          no-caps
          v-close-popup
          data-id="workspace-save-settings"
          class="secondary-btn"
          :disable="!isValidName"
          @click="handleUpdateWorkspace"
        >
          Сохранить
        </q-btn>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { useMeta, useQuasar, Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { onMounted, ref, computed, nextTick } from 'vue';

// stores
import { useUtilsStore } from 'src/stores/utils-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useSettingsStore } from 'src/modules/workspace-settings/stores/settings-store';

// utils
import { maxLength, validateAllowedCharacters } from 'src/utils/validation';
import { getUrlFile, getFirstSymbol } from 'src/utils/helpers';
import {
  updateWorkspace,
  resetWorkspaceToken,
  deleteWorkspaceLogo,
} from 'src/modules/workspace-settings/services/api';
import aiplan from 'src/utils/aiplan';

// constants
import {
  BASE_ERROR,
  SUCCESS_UPDATE_DATA,
  SUCCESS_SAVE_WS_SETTINGS,
  SUCCESS_DELETE_IMG_WS,
  SUCCESS_CREATE_IMG_WS,
  SUCCESS_RESET_TOKEN_WS,
  SUCCES_COPY_TOKEN_USER,
} from 'src/constants/notifications';
import { NOT_VALID_UID } from 'src/constants/constants';

// components
import {
  ImportDialog,
  DeleteWorkspaceModal,
  UploadWorkspaceAvatarDialog,
} from 'src/modules/workspace-settings/ui/dialogs';
import SelectLeader from 'components/selects/SelectLeader.vue';
import { TIPTAP_TABS } from 'src/constants/tiptap';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import { isEditorEmpty } from 'src/components/editorV2/utils/editorUtils';
import AvatarImage from 'src/components/AvatarImage.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';

const props = defineProps({
  currentWsInfo: { type: Object, required: true },
  currentWsSlug: { type: String, required: true },
  isInAdminPanel: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});

//composables
const q = useQuasar();

// for utils
const route = useRoute();
const metadata = ref({
  title: 'Загрузка...',
});

// stores
const utilsStore = useUtilsStore();
const workspaceStore = useWorkspaceStore();
const settingsStore = useSettingsStore();
const { setNotificationView } = useNotificationStore();
const { hasPermission, hasPermissionByWorkspace } = useRolesStore();

// stores to refs
const { isDemo } = storeToRefs(utilsStore);
const { workspaceToken } = storeToRefs(settingsStore);
const workspaceInfoForm = ref({} as typeof computedWorkspaceInfo.value);

// флаги для открытия диалогов
const isImportOpen = ref<boolean>(false);
const isDeleteOpen = ref<boolean>(false);
const isUploaderOpen = ref<boolean>(false);
const isSelectLeadOpen = ref<boolean>(false);
const isValidName = ref<boolean>(false);

// флаг для скрытия/показа токена
const isToken = ref<boolean>(true);

// флаг ошибки аватара
const isAvatarError = ref<boolean>(false);

// опции лидер пространства
const leadWorkspaceOptions = ref<any[]>([]);
const oldLeadWs = ref(null);

//computeds
const computedWorkspaceInfo = computed(() => props.currentWsInfo);
const isMobile = computed(() => {
  return q.platform.is.mobile && Screen.lt.md;
});

const canEdit = computed(() =>
  hasPermissionByWorkspace(computedWorkspaceInfo.value, 'ws-settings'),
);

onMounted(async () => {
  await refreshInfo();
  await refreshToken();
  setAnotherTitle(workspaceInfoForm.value.name);
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

const updateEditorDOM = (value: boolean) => {
  editorDOMvalue.value = value;
};

function setAnotherTitle(title: string) {
  metadata.value.title = `Настройки ${title}`;
}

function onSuccess(msg?: string) {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
}

const avatarText = (text: string) => {
  return aiplan.UserName(text);
};

// функции рефреша данных текущего спейса
const refreshInfo = async () => {
  await getLeadOptions();
  if (props.isInAdminPanel) {
  } else {
    await workspaceStore
      .getWorkspaceInfo(route.params['workspace'] as string)
      .then(() => {
        // Проверяем есть ли доступ к настройкам рабочего пространства
        if (
          !hasPermissionByWorkspace(computedWorkspaceInfo.value, 'ws-settings')
        ) {
        }
      });
  }
  isAvatarError.value = false;
  workspaceInfoForm.value = JSON.parse(
    JSON.stringify(computedWorkspaceInfo.value),
  );
  setAnotherTitle(computedWorkspaceInfo.value.name);

  workspaceInfoForm.value.owner_id = leadWorkspaceOptions.value.find(
    (el) => el.value === computedWorkspaceInfo.value?.owner_id,
  ) ?? {
    label: 'Не выбран',
    value: null,
  };
};

const refreshToken = async () => {
  await settingsStore.setWorkspaceToken(route.params['workspace'] as string);
};

const getLeadOptions = async () => {
  await workspaceStore.getWorkspaceMembers(props.currentWsSlug).then((res) => {
    leadWorkspaceOptions.value = (res?.result || [])
      .filter((member: any) => member.role === 15)
      .map((member: any) => {
        return {
          ...member,
          label: `${member.member.last_name} ${member.member.first_name}`,
          value: member.member.id,
        };
      });
  });
};

// апдейт данных спейса
const handleUpdateWorkspace = async () => {
  if (!workspaceInfoForm.value) return;
  if (isEditorEmpty(editorDOMvalue.value)) {
    workspaceInfoForm.value.description = '';
  }

  const payload = {
    name: workspaceInfoForm.value.name,
    description: workspaceInfoForm.value.description,
    owner_id: workspaceInfoForm.value.owner_id.value,
  };

  await updateWorkspace(workspaceInfoForm.value.slug, payload)
    .then(async () => {
      await refreshInfo();

      onSuccess(SUCCESS_SAVE_WS_SETTINGS);
      setAnotherTitle(workspaceInfoForm.value.name);
    })
    .catch(async () => {
      onSuccess(BASE_ERROR);
      await refreshInfo();
    });
};

// const handleOpenImport = () => {
//   isImportOpen.value = !isImportOpen.value;
// };

// const downloadBackup = async () => {
//   await exportWorkspace(route.params['workspace'] as string).then(
//     ({ asset }) => {
//       const element = document.createElement('a');
//       element.setAttribute('href', `/uploads/${asset}`);
//       element.setAttribute(
//         'download',
//         `backup-${new Date().toISOString()}.bin`,
//       );
//       element.click();
//       onSuccess(SUCCESS_EXPORT);
//     },
//   );
// };


const isWorkspaceLogo = computed(() => {
  return (
    !!workspaceInfoForm.value?.logo &&
    workspaceInfoForm.value.logo !== NOT_VALID_UID
  );
});

const handleResetWsToken = async () => {
  try {
    await resetWorkspaceToken(route.params['workspace'] as string);
    await refreshToken();
    onSuccess(SUCCESS_RESET_TOKEN_WS);
  } catch {}
};

const handleCopyWorkspaceToken = () => {
  if (!workspaceToken || !workspaceToken.value) return;
  navigator.clipboard.writeText(workspaceToken.value).then(() => {
    onSuccess(SUCCES_COPY_TOKEN_USER);
  });
};

const handleDeleteWorkspaceAvatar = async () => {
  try {
    await deleteWorkspaceLogo(workspaceInfoForm.value.slug);
    await refreshInfo();
    onSuccess(SUCCESS_DELETE_IMG_WS);
  } catch {}
};

const validateName = (val: string): boolean | string => {
  isValidName.value = false;
  const minL =
    val.trim().length >= 3 || 'Название должно содержать 3 или более символов';
  const maxL = maxLength(val, 100);
  const characters = validateAllowedCharacters(val, 'Название');

  if (typeof minL === 'string') {
    return minL;
  } else if (typeof maxL === 'string') {
    return maxL;
  } else if (typeof characters === 'string') {
    return characters;
  }

  isValidName.value = true;
  return true;
};

const handleAvatarError = () => {
  nextTick(() => {
    isAvatarError.value = true;
  });
};

// Редактор

const editor = ref<Editor | undefined>();
// Текст в диалоговом окне
const editorValueDialog = ref<string | undefined>();
// Переключатель диалогового окна
const isFullscreen = ref<boolean>(false);
// EditorDOM
const editorDOMvalue = ref();

const getEditor = (value: Editor) => {
  editor.value = value;
};
const toggleFullscreen = (): void => {
  isFullscreen.value = !isFullscreen.value;
};
// Перенос текста в диалоговое окно
const updateEditorValueDialog = (): void => {
  editorValueDialog.value = workspaceInfoForm.value.description;
};
// Перенос текста из диалогового окна
const updateEditorValue = (): void => {
  workspaceInfoForm.value.description = editorValueDialog.value;
};
</script>

<style scoped lang="scss">
.issue-panel__editor {
  :deep(.html-editor__container) {
    min-height: 12.5rem;
    height: 12.5rem;

    .tiptap {
      min-height: 12.5rem;
    }
  }
}

.owner-name {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  display: inline-block;
}

.issue-panel-avatar {
  line-height: 1;
  vertical-align: middle;
}

.q-btn svg {
  vertical-align: middle;
}

.dialog-select-leader {
  min-width: 500px;
  min-height: 100px;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
