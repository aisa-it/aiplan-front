<template>
  <q-page v-if="!loading" class="flex justify-center flex-grow">
    <q-layout
      v-if="!isEmptyDoc"
      view="hHh lpr fFf"
      class="issue-panel__layout q-pt-sm flex flex-col no-wrap flex-grow"
    >
      <q-page-container class="flex-grow">
        <div
          class="col items-stretch content-stretch flex column issue-panel__wrapper full-height no-wrap"
          :style="'position: relative'"
        >
          <EditorHeader
            v-model="documentValue.title"
            :canEdit="canEdit"
            :document="documentValue"
            :docVersionList="docVersionList"
            :author="documentValue.author"
            :lastUpdateBy="documentValue.update_by"
            :createDate="getDocDate(documentValue.created_at)"
            :updateDate="getDocDate(documentValue.update_at)"
            :isAdminOrAuthor="isAdminOrAuthor"
            :loading="isDocumentEditPending"
            :rules="[
              (val) =>
                (val.trim() && val.trim().length > 0) ||
                'Необходимо ввести название',
              (val) => val.length < 151 || 'Максимальный размер - 150 символов',
            ]"
            @refresh="handleRefreshDocSettings"
            @save-value="handleUpdateTitleAndEditor"
            @openDeleteDialog="openDeleteDialog"
            @updateDocument="updateDocument"
          />
          <div
            class="q-px-sm full-w"
            ref="editorContainer"
            @drop.prevent="
              (e: DragEvent) => (!isReadOnlyEditor ? handleDrop(e) : '')
            "
            @dragover.prevent
          >
            <EditorTipTapV2
              v-model="documentValue.content"
              ref="aidocEditor"
              editor-id="aidoc-editor"
              :read-only-editor="isReadOnlyEditor"
              :canEdit="canEdit"
              class="issue-panel__editor"
              :class="{ 'ny-theme': ny }"
              :class-prevent="isAutoSave ? preventClickClass : ''"
              can-resize
              is-mention
              show-headings
              :members="workspaceUsers"
              :get-members-for-mention="getWorkspaceMembersForMention"
              @enable-editing="handleEnableEdit"
              v-click-outside:prevent-click-issue-outside="{
                isAutoSave,
              }"
              @get-editor="(value) => (editor = value)"
            />
          </div>

          <div
            v-if="canEdit && !isReadOnlyEditor"
            class="issue-panel__action-editor q-px-sm"
          >
            <q-btn
              class="secondary-btn"
              :class="isAutoSave ? preventClickClass : ''"
              no-caps
              @click="handleUndoEdit"
            >
              Отмена
            </q-btn>
            <q-btn
              class="primary-btn"
              :class="isAutoSave ? preventClickClass : ''"
              no-caps
              @click="handleUpdateTitleAndEditor"
            >
              Сохранить
            </q-btn>
          </div>
          <SelectAttachments
            v-if="documentValue.id"
            entity-type="doc"
            :delete-attachment-func="deleteAttachment"
            :get-attachment-func="getAttachmentsList"
            :upload-attachment-func="uploadAttachments"
            :is-edit="canEdit"
            :id="documentValue.id"
            ref="selectAttachments"
          />
          <q-chip
            v-if="documentValue.llm_content"
            class="q-px-xs q-py-md hint-overlay"
            dense
            style="position: fixed; bottom: 8px; z-index: 9999"
          >
            <LLMIcon />
            <span class="hint-overlay__text">Создано с помощью ИИ</span>
          </q-chip>
          <div class="q-px-sm">
            <q-separator class="q-mt-sm" />
          </div>
          <AidocComments :documentId="documentValue.id" />
        </div>
        <DeleteDocDialog v-model="showDeleteDialog" :document="documentValue" />
        <AidocImportExport
          v-model="showImportExportDialog"
          :itemExport="currentExportDialogItem"
        />
      </q-page-container>
    </q-layout>

    <AiDocEmptyPlaceholder
      v-else
      style="margin: 0 auto"
      :is-admin-or-author="isAdminOrAuthor"
    />
  </q-page>

  <q-page v-else class="flex justify-center items-center">
    <q-inner-loading showing> <DefaultLoader /> </q-inner-loading
  ></q-page>
</template>

<script lang="ts" setup>
//core
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted, watch } from 'vue';
import { useMeta } from 'quasar';
import { useRoute } from 'vue-router';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';

// interfaces
import {
  DtoDoc,
  DtoHistoryBodyLight,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import SelectAttachments from 'src/components/SelectAttachments.vue';
import EditorHeader from 'src/components/EditorHeader.vue';
import DeleteDocDialog from 'src/components/dialogs/AIDocDialogs/DeleteDocDialog.vue';
import AidocComments from 'src/components/aidoc/AidocComments.vue';
import AidocImportExport from 'src/components/aidoc/AidocImportExport.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import { cleanContent } from 'src/components/editorV2/utils/editorUtils';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import { SUCCESS_UPDATE_DOCUMENT } from 'src/constants/notifications';
//utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
import AiDocEmptyPlaceholder from 'src/components/AiDocEmptyPlaceholder.vue';
import { Editor } from '@tiptap/vue-3';
import { useAttachmentsWithEditor } from 'src/composables/useAttachmentsWithEditor';
import LLMIcon from 'src/components/icons/LLMIcon.vue';

//composables
const route = useRoute();

//stores
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const aidocStore = useAiDocStore();
const utilsStore = useUtilsStore();
const { hasPermission } = useRolesStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { workspaceInfo, workspaceUsers } = storeToRefs(workspaceStore);
const { user } = storeToRefs(userStore);
const { ny } = storeToRefs(utilsStore);

//states
const aidocEditor = ref();
const isReadOnlyEditor = ref(true);
const documentValue = ref<DtoDoc>({});
const updateCurrentEditorValue = ref();
const showDeleteDialog = ref(false);
const showImportExportDialog = ref(false);
const currentExportDialogItem = ref();
const docVersionList = ref<DtoHistoryBodyLight[]>([]);
const loading = ref(false);
const isDocumentEditPending = ref(false);
const metadata = ref({
  title: 'Загрузка...',
});

//composables
useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

//consts
const preventClickClass = 'prevent-click-issue-outside';
// const listItem = [
// { title: 'Права доступа', disabled: true, emit: 'accessRights' },
// { title: 'Экспорт в PDF', disabled: true, emit: 'exportPdf' },
// { title: 'Экспорт в Word', disabled: true, emit: 'exportWord' },
// {
//   title: 'Импорт документа в Word',
//   disabled: false,
//   emit: 'importWord',
//   extensions: ['doc', 'docx'],
// },
// { title: 'Переместить', disabled: true, emit: 'moveDocument' },
//   { title: 'Удалить', disabled: false, emit: 'openDeleteDialog' },
// ];

//computeds
const currentUserRole = computed(() => {
  return workspaceInfo.value?.current_user_membership?.role ?? 0;
});

const canEdit = computed(() => {
  return (
    currentUserRole.value >= documentValue.value?.editor_role ||
    documentValue.value?.editor_ids?.includes(user.value.id) ||
    isAdminOrAuthor.value
  );
});

const isAdminOrAuthor = computed(() => {
  return (
    hasPermission('change-issue-primary') ||
    documentValue.value?.author?.id === user.value.id
  );
});

const isAutoSave = computed(() => user.value?.view_props?.autoSave);

const isEmptyDoc = computed(
  () => Object.keys(documentValue.value).length === 0,
);

//methods
const getDocDate = (date: string) => {
  return date?.split('T')[0].split('-').reverse().join('.');
};

const handleRefreshDocSettings = async () => {
  isDocumentEditPending.value = true;
  await refreshDocument();
  isDocumentEditPending.value = false;
};
const refreshDocument = async () => {
  if (!route.params.workspace || !route.params.doc) {
    return;
  }

  const { data } = await aidocStore.getAiDoc(
    route.params.workspace as string,
    route.params.doc,
  );
  documentValue.value = data;
  documentValue.value.content = data.content;
  const parentDocId = data.parent_doc ? data.parent_doc : null;
  aidocStore.setParentDoc(parentDocId);
  aidocStore.selectDoc(data.id, data.title);
  aidocStore.setUpdatedDoc(null);

  metadata.value.title = `Документ ${documentValue.value.title}`;
  await getListVersion();
};

const handleEnableEdit = () => {
  isReadOnlyEditor.value = false;
  updateCurrentEditorValue.value = documentValue.value.content;

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const handleUndoEdit = () => {
  isReadOnlyEditor.value = !isReadOnlyEditor.value;
  documentValue.value.content = updateCurrentEditorValue.value;
  updateCurrentEditorValue.value = undefined;
};

const handleUpdateTitleAndEditor = () => {
  isReadOnlyEditor.value = true;
  updateCurrentEditorValue.value = undefined;
  updateDocument();
};

const updateDocument = async (roles = {}) => {
  try {
    loading.value = true;
    aidocEditor.value.updateToC();
    documentValue.value.content = cleanContent(documentValue.value.content);
    const contents = await handleEditorValue(documentValue.value.content);
    await aidocStore.updateDocument(
      {
        doc: {
          title: documentValue.value.title,
          content: contents.html,
          reader_role: roles.reader_role ?? undefined,
          editor_role: roles.editor_role ?? undefined,
          reader_list: roles.reader_ids ?? undefined,
          editor_list: roles.editor_ids ?? undefined,
        },
        files: contents.files,
      },
      route.params.workspace,
      route.params.doc,
    );
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_UPDATE_DOCUMENT,
    });

    await refreshDocument();
  } catch (e) {
  } finally {
    loading.value = false;
  }
};

const openDeleteDialog = () => {
  showDeleteDialog.value = true;
};

// const openImportExportDialog = (type: string) => {
//   currentExportDialogItem.value = listItem.find((el) => el.emit === type);
//   showImportExportDialog.value = true;
// };

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

// блок вложений

const getAttachmentsList = async () => {
  return await aidocStore.docAttachmentsList(
    route.params.workspace as string,
    route.params.doc as string,
  );
};

const uploadAttachments = async (ev: object) => {
  await aidocStore.docAttachmentsUpload(ev, route.params.doc);
};

const deleteAttachment = async (attachmentId: string) => {
  await aidocStore.docAttachmentDelete(
    route.params.workspace,
    route.params.doc,
    attachmentId,
  );
};

const getListVersion = async () => {
  docVersionList.value = await aidocStore.getListVersion(
    route.params.workspace,
    route.params.doc,
  );
};

const editorContainer = ref<HTMLElement>();
const selectAttachments = ref();
const editor = ref<Editor>();

const { handleDrop } = useAttachmentsWithEditor(
  editor,
  (file: File) =>
    aidocStore.uploadDocAttachments(
      route.params?.workspace as string,
      route.params?.doc as string,
      [file],
    ),
  getAttachmentsList,
  () => selectAttachments.value.refresh(),
);

//hooks
onMounted(async () => {
  loading.value = true;
  await refreshDocument();
  loading.value = false;

  if (isEmptyDoc.value) {
    aidocStore.selectDoc('', '');
    aidocStore.parentDocId = null;
  }
});

watch(
  () => workspaceInfo.value,
  (newVal) => {
    if (newVal?.name && !route.params.doc)
      metadata.value.title = `АИДок ${workspaceInfo?.value?.name}`;
  },
);
</script>

<style lang="scss" scoped>
.readonly-title-issue {
  .readonly-title-issue__edit {
    background-color: $border-color;
    border-radius: 0 8px 8px 0;
    visibility: hidden;
    z-index: -1;
    transition: 0.12s all ease-in-out;
  }

  :deep(.q-field__control) {
    padding-right: 0;

    &::before {
      outline: 1px solid transparent;
    }

    &:hover::before {
      outline: 1px solid $extra-light;
      transition: 0.15s all ease-in-out;
    }

    &:hover {
      .readonly-title-issue__edit {
        visibility: visible;
        z-index: 1;
      }
    }

    .q-field__marginal {
      height: auto;

      .q-btn {
        height: 100%;
      }
    }
  }

  &.no-outline {
    :deep(.q-field__control) {
      &::before {
        outline: 1px solid transparent;
      }
    }
  }
}

.issue-header__wrapper {
  padding-bottom: 20px;
  .q-field--with-bottom {
    padding-bottom: 0;
  }
}

.issue-side-drawer {
  @media screen and (max-width: 760px) {
    width: 90% !important;
  }
}

.issue-panel__autor-label {
  flex-wrap: nowrap;
}

.issue-panel__action-editor {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  width: 99%;
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding-bottom: 1rem;
  margin-top: auto;
}

.issue-panel__wrapper {
  gap: 8px;
  @media screen and (max-width: 550px) {
    flex-wrap: nowrap;
  }
}

:deep(.q-drawer) {
  position: fixed;
  top: 50px;
  padding: 8px 0;
  margin-right: 10px !important;
  background: none;
}

.issue-panel__editor {
  :deep(.html-editor__container) {
    min-height: 38.375rem;
    height: auto;
  }
  :deep(.tiptap) {
    min-height: 34.375rem;
    border-color: black !important;
  }
}

:deep(.html-editor) {
  overflow: visible !important;
}

:deep(.html-editor__toolbar) {
  height: auto;
  position: sticky;
  top: 50px;
  z-index: 10;
  background-color: $bg-color;
  border-radius: 0;
}

.ny-theme :deep(.html-editor__toolbar) {
  top: 80px;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background-color: $bg-color;
  }
}
</style>
