<template>
  <q-btn
    dense
    flat
    no-caps
    no-wrap
    :align="mini ? 'center' : 'left'"
    class="btn-only-icon-sm"
    @click="isShowVersion = true"
  >
    <q-icon name="history" dense size="24px" />
    <HintTooltip class="q-ml-sm">Версии</HintTooltip>
    <span v-if="!mini" class="q-ml-xs">Версии</span>
  </q-btn>
  <q-dialog v-model="isShowVersion">
    <q-card class="dialog-card">
      <q-card-section class="row no-wrap items-center">
        <div class="text-h6 text-weight-bold text-wrap">Версии</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="list-container">
          <q-list class="version-list-wrapper">
            <q-item
              v-for="version in docVersionList"
              :key="version.Id"
              class="version-card"
            >
              <q-item-section
                class="issue-link-card q-pa-md"
                @click="showVersionPreview(version)"
              >
                <q-item-label>
                  <span class="abbriviated-text" style="text-align: start">
                    {{ getFormatDateAndTime(version.crated_at) }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="2" class="sub-text">
                  {{ version.Author.last_name }} {{ version.Author.first_name }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="isFullscreenEditor">
    <q-card class="fullscreen-dialog row" style="height: 750px">
      <div class="q-pl-sm q-pt-sm flex column">
        <span
          >Версия:
          <span class="text-bold">{{
            getFormatDateAndTime(currentVersion?.crated_at)
          }}</span></span
        >
        <span>
          Автор:
          <span class="text-bold">
            <AvatarImage
              :text="
                [
                  aiplan.UserName(currentVersion?.Author)[0]?.at(0),
                  aiplan.UserName(currentVersion?.Author)[1]?.at(0),
                ].join(' ')
              "
              :image="currentVersion?.Author.avatar_id"
              :show-avatar-popup="true"
              :member="currentVersion?.Author"
              @click.stop="navigateToActivityPage(currentVersion?.Author.id)"
              size="22px"
            />
            {{ currentVersion?.Author.last_name }}
            {{ currentVersion?.Author.first_name }}
          </span></span
        >
      </div>
      <div
        v-if="loadingEditor"
        class="row justify-center full-w q-py-sm"
        style="align-items: center"
      >
        <DefaultLoader :size="70" />
      </div>
      <EditorTipTapV2
        v-else-if="oldValueVersion?.old_body"
        :model-value="oldValueVersion.old_body"
        :canEdit="false"
        editor-id="version-editor-dialog"
        class="html-editor-version"
        isFullScreen
        isFullScreenView
        is-mention
        :members="workspaceUsers"
        :get-members-for-mention="getWorkspaceMembersForMention"
        style="border: none; height: 80%"
      />
      <div
        v-if="!loadingEditor && !isDisabled"
        class="q-pa-sm row justify-end full-w"
        style="max-height: 60px"
      >
        <q-btn
          no-caps
          class="secondary-btn q-mr-sm"
          label="Отмена"
          v-close-popup
        />
        <q-btn
          @click="setVersion"
          no-caps
          class="primary-btn create-btn"
          label="Восстановить"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLoader from '../loaders/DefaultLoader.vue';
import EditorTipTapV2 from '../editorV2/EditorTipTapV2.vue';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import {
  SUCCESS_SETUP_VERSION,
  ERROR_SETUP_VERSION,
} from 'src/constants/notifications';
import AvatarImage from '../AvatarImage.vue';
import aiplan from 'src/utils/aiplan';
import { storeToRefs } from 'pinia';
import {
  DtoHistoryBodyLight,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useMenuHandler } from 'src/composables/useMenuHandler';
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

interface Version {
  Id: string;
  crated_at: string;
  Author: {
    first_name: string;
    last_name: string;
  };
  old_body?: string;
}

defineProps<{
  docVersionList: DtoHistoryBodyLight[];
  isDisabled: boolean;
  mini?: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const route = useRoute();
const aidocStore = useAiDocStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const currentVersion = ref<Version | null>(null);
const oldValueVersion = ref<Version | null>(null);
const isShowVersion = ref(false);
const isFullscreenEditor = ref(false);
const loadingEditor = ref(false);
const popup = ref();

// storetorefs
const { workspaceUsers } = storeToRefs(workspaceStore);

// composables
const { navigateToActivityPage } = useUserActivityNavigation();

const setVersion = async () => {
  if (!currentVersion.value) return;

  try {
    await aidocStore.setVersionDoc(
      String(route.params.workspace),
      String(route.params.doc),
      currentVersion.value.Id,
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_SETUP_VERSION,
    });
    emit('refresh');
  } catch {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: ERROR_SETUP_VERSION,
    });
  } finally {
    isFullscreenEditor.value = false;
  }
};

const showVersionPreview = async (version: Version) => {
  if (!version) return;

  currentVersion.value = version;
  try {
    isFullscreenEditor.value = true;
    loadingEditor.value = true;
    oldValueVersion.value = await aidocStore.getVersionPreview(
      String(route.params.workspace),
      String(route.params.doc),
      version.Id,
    );
  } finally {
    loadingEditor.value = false;
  }
};

function getFormatDateAndTime(val: string, isHaveTime = true) {
  const [datePart, timePart] = val.split('T');
  const formattedDate = datePart.split('-').reverse().join('.');
  const time = isHaveTime ? timePart.split(':').slice(0, 2).join(':') : '';
  return `${formattedDate} ${time}`;
}

//TODO дубляж функции в компонентах CreateDocPageDialog, AiDocPage, AidocActivityComments, AidocVersionSelect
const getWorkspaceMembersForMention = async (
  search: string,
): Promise<DtoWorkspaceMember[] | undefined> => {
  const arr = await workspaceStore.getWorkspaceMembers(
    route.params.workspace as string,
    { offset: 0, limit: 4, order_by: 'id', desc: false, search_query: search },
  );
  return arr?.result;
};

useMenuHandler(popup);
</script>

<style lang="scss" scoped>
.version-list-wrapper {
  border: 1px solid var(--q-border-color);
  border-radius: 8px;
  max-height: 750px;
  overflow-y: auto;
}

.version-card {
  width: 100%;
  border-radius: 8px;
  padding: 0px !important;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.issue-link-card {
  transition: background-color 0.3s ease;
}

.issue-link-card:hover {
  transition: background-color 0.3s ease;
  background-color: var(--spoiler-hover-color);
  cursor: pointer;
}

.list-container {
  max-height: 750px;
  width: 300px;
}

::v-deep(.html-editor__wrapper) {
  height: 100%;
}
::v-deep(.html-editor__container) {
  height: 100%;
}
</style>
