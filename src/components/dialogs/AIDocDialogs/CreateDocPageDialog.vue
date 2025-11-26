<template>
  <q-dialog
    ref="dialogRef"
    persistent
    @hide="
      () => {
        clear();
      }
    "
  >
    <q-card class="form-modal-card q-pa-lg">
      <q-form ref="formRef" @submit="onSave">
        <q-card-section class="column q-pa-none gap-md">
          <div class="row justify-between flex-column q-mb-md">
            <h5 class="q-ma-none">Создание страницы документа</h5>
            <q-btn
              v-if="!$q.screen.lt.sm"
              flat
              dense
              rounded
              icon="close"
              @click="() => dialogRef?.hide()"
            />
          </div>
          <q-input
            v-model="state.title"
            ref="formTitle"
            dense
            label="Введите название страницы"
            class="base-input project-input"
            :rules="[
              (val) =>
                (val.trim() && val.trim().length > 0) ||
                'Необходимо ввести название',
              (val) => val.length < 151 || 'Максимальный размер - 150 символов',
            ]"
          />
          <div>
            <q-input
              :model-value="folder.title"
              readonly
              dense
              label="Выберите родительскую страницу"
              class="base-input project-input"
            >
              <template v-slot:append>
                <ArrowDown
                  class="chevron-rotate"
                  :class="{ 'rotate-180': isOpenTree }"
                />
              </template>
            </q-input>
            <q-menu
              fit
              v-model="isOpenTree"
              :style="`width: ${treeMenuWidth + 'px'}`"
              max-height="400px"
              class="scrollable-content"
            >
              <q-card>
                <q-card-section>
                  <q-checkbox
                    v-if="!isChildDocsLoading"
                    label="Сделать корневым документом"
                    :model-value="srcDocBool"
                    @update:model-value="updateSrcDoc"
                  />
                  <q-tree
                    v-show="!isChildDocsLoading"
                    ref="treeRef"
                    :nodes="treeNode"
                    node-key="id"
                    label-key="title"
                    :selected="folder.id"
                    @update:selected="onSelect"
                    @lazy-load="lazyLoad"
                  >
                    <template v-slot:default-header="prop">
                      <q-item
                        class="tree-custom-header block q-pa-none"
                        :active="prop.key === folder.id"
                      >
                        {{ prop.node.title }}
                      </q-item>
                    </template>
                  </q-tree>
                  <div v-if="isChildDocsLoading" class="flex justify-center">
                    <DefaultLoader />
                  </div>
                </q-card-section>
              </q-card>
            </q-menu>
          </div>

          <SelectWatchers
            v-model:watchers="watcherList"
            :current-member="user"
            :isDisabled="false"
            class="watchers-selector"
            hide-dropdown-icon
          ></SelectWatchers>

          <EditorTipTapV2
            v-if="false"
            v-model="state.content"
            editor-id="form-editor-id"
            class="description-editor"
            editor-placeholder="Описание"
            :members="workspaceUsers"
            :get-members-for-mention="getWorkspaceMembersForMention"
            is-mention
            show-headings
          />
          <div v-if="false" class="column">
            <q-btn
              @click="() => fileInput?.click()"
              class="secondary-btn"
              :style="$q.screen.lt.sm ? 'width: 100%' : ''"
              flat
              dense
              no-caps
            >
              <AddIcon :color="'#3f75ff'" />
              <span style="font-size: 16px">Добавить вложения</span>
            </q-btn>
            <input
              @change="onLoadFile"
              type="file"
              ref="fileInput"
              style="display: none"
              multiple
              :accept="acceptFileTypes"
            />
            <div class="q-mt-xs">
              <AidocAttachmentsInfo />
            </div>
          </div>
          <q-resize-observer @resize="onResize" />
        </q-card-section>
        <div
          class="row scrollable-content q-mt-sm gap-md"
          style="flex: 1; max-height: 150px"
          :style="`overflow-y: auto`"
        >
          <AttachmentCard
            v-for="(row, index) in attachments"
            ref="attachmentCardRef"
            :key="row.name"
            :row="row"
            @delete="onDeleteFile(index)"
          />
        </div>
        <q-card-section
          class="q-pb-none q-pr-none q-pl-none"
          :class="$q.screen.lt.sm ? 'column' : 'row justify-end'"
        >
          <q-btn
            no-caps
            class="secondary-btn q-mr-sm"
            :style="$q.screen.lt.sm ? 'order: 1; width: 100%' : 'width: 95px'"
            label="Отмена"
            @click="() => dialogRef?.hide()"
          />
          <q-btn
            no-caps
            class="primary-btn create-btn"
            :class="$q.screen.lt.sm ? 'q-mb-sm' : ''"
            label="Создать"
            @click="formRef?.submit()"
            :disabled="isDisabled"
            :style="$q.screen.lt.sm ? 'width: 100%' : 'width: 102px'"
          />
        </q-card-section>
        <q-inner-loading
          style="max-width: none; max-height: 100%; height: 100vh; z-index: 99"
          color="primary"
          :showing="isLoading"
        >
          <DefaultLoader />
        </q-inner-loading>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//core
import {
  ComponentPublicInstance,
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { QDialog, QForm, QInput, QTree } from 'quasar';
import { storeToRefs } from 'pinia';
//stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';
// components
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import AddIcon from 'src/components/icons/AddIcon.vue';
import AttachmentCard from './cards/AttachmentCard.vue';
import ArrowDown from 'src/components/icons/ArrowDown.vue';
import AidocAttachmentsInfo from 'src/components/AttachmentsInfo.vue';
import SelectWatchers from 'src/components/selects/SelectWatchers.vue';
// utils
import { mapDocNode } from 'src/utils/tree';
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
//types
import {
  AIDOC_ACCEPT_FILE_TYPES_STRING,
  MAX_SIZE_FILE,
} from 'src/constants/aidocFiles';
import { DtoWorkspaceMember } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const emit = defineEmits<{ successCreate: [] }>();

//core
const route = useRoute();

//stores
const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const userStore = useUserStore();
const aidocStore = useAiDocStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { workspaceUsers } = storeToRefs(workspaceStore);
const { rootDocs } = storeToRefs(docStore);
const { user } = storeToRefs(userStore);
const { parentDocId, selectedDocId, selectedDocTitle } =
  storeToRefs(aidocStore);

//constants
const acceptFileTypes = AIDOC_ACCEPT_FILE_TYPES_STRING;

//state
const state = reactive({
  title: '',
  content: '',
});

const folder = reactive({
  id: '',
  title: '',
});

const dialogRef = ref<QDialog | null>();
const formRef = ref<QForm | null>();
const treeRef = ref<QTree | null>();

//doc cache
const expandedChainsCache = ref<Record<string, string[]>>({});
const childrenCache = ref<Record<string, any[]>>({});

const attachmentCardRef = ref<
  ComponentPublicInstance<typeof AttachmentCard>[] | null
>();
const fileInput = ref<HTMLInputElement | null>(null);
const attachments = ref<File[]>([]);
const formTitle = ref<QInput | null>();
const isOpenTree = ref(false);
const isLoading = ref(false);
const isChildDocsLoading = ref(false);
const srcDocBool = ref(false);
const treeMenuWidth = ref(0);
const watcherList = ref([]);
const isManuallySelected = ref(false);

//computed
const treeNode = computed(() =>
  rootDocs.value.map((el) => {
    return {
      id: el.id,
      title: el.title,
      lazy: el.has_child_docs,
    };
  }),
);

const isDisabled = computed(() => {
  return (
    !state.title ||
    attachmentCardRef.value?.some((attachment) => !attachment.isAvailable) ||
    state.title.length > 150
  );
});

const workspaceSlug = computed(() => {
  return route.params.workspace ? String(route.params.workspace) : '';
});

//methods
const updateSrcDoc = (val: boolean) => {
  srcDocBool.value = val;
  if (val) {
    clearFolder();
    folder.title = 'Корневой';
  } else {
    clearFolder();
  }
};

const clear = () => {
  state.title = '';
  state.content = '';
  watcherList.value = [];
  folder.title = 'Корневой';
  folder.id = '';
  attachments.value = [];
  srcDocBool.value = true;
};

const clearFolder = () => {
  folder.title = '';
  folder.id = '';
};

const onLoadFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  const fileArray = Array.from(files);
  const validFiles = fileArray.filter((file) => file.size <= MAX_SIZE_FILE);
  const tooLargeFiles = fileArray.filter((file) => file.size > MAX_SIZE_FILE);

  if (tooLargeFiles.length) {
    tooLargeFiles.forEach((file) => {
      const message = `Данный файл превышает максимальный размер 50MB: ${file.name}`;
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: message,
      });
    });
  }

  attachments.value.push(...validFiles);
};
const onDeleteFile = (index: number) => {
  attachments.value.splice(index, 1);
};

const onSave = async () => {
  const contents = await handleEditorValue(state.content);
  isLoading.value = true;
  try {
    if (!folder.id) {
      await docStore.createRootDoc(
        workspaceSlug.value,
        {
          doc: {
            title: state.title,
            content: contents.html,
            watcher_list: watcherList.value,
          },
          files: contents.files,
        },
        attachments.value,
      );
    } else {
      await docStore.createChildDoc(
        workspaceSlug.value,
        folder.id,
        {
          doc: {
            title: state.title,
            content: contents.html,
            watcher_list: watcherList.value,
          },
          files: contents.files,
        },
        attachments.value,
      );
    }

    emit('successCreate');
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Документ успешно создан',
    });
  } catch (error) {
    console.error('Ошибка при создании документа:', error);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка при создании документа',
    });
  } finally {
    isLoading.value = false;
    dialogRef.value?.hide();
  }
};
const onSelect = (id: string, setFolder = true) => {
  let node: Record<string, any> = {};
  clearExpandedCache();
  isManuallySelected.value = true;
  if (id) {
    srcDocBool.value = false;

    node = treeRef.value?.getNodeByKey(id);
    if (setFolder) {
      folder.title = node.title;
      folder.id = id;
    }
    treeRef.value?.setExpanded(id, true);
  } else {
    clearFolder();
    if (node?.children) treeRef.value?.setExpanded(id, false);
  }
};

const lazyLoad = async ({
  key,
  done,
}: {
  key: string;
  done: (children?: readonly any[]) => void;
}) => {
  // Если уже есть в кэше — сразу done
  if (childrenCache.value[key]) {
    done(childrenCache.value[key].map(mapDocNode));
    return;
  }

  const response = await docStore.getChildDocList(workspaceSlug.value, key);
  childrenCache.value[key] = response.data;
  done(response.data.map(mapDocNode));
};

const onResize = (size: any) => {
  treeMenuWidth.value = size.width;
};

//TODO дубляж функции в компонентах CreateDocPageDialog, AiDocPage, AidocActivityComments, AidocVersionSelect
const getWorkspaceMembersForMention = async (
  search: string,
): Promise<DtoWorkspaceMember[] | undefined> => {
  const arr = await workspaceStore.getWorkspaceMembers(workspaceSlug.value, {
    offset: 0,
    limit: 4,
    order_by: 'id',
    desc: false,
    search_query: search,
  });
  return arr?.result;
};

const initParentDoc = () => {
  if (!selectedDocId.value) return;

  updateSrcDoc(false);

  folder.id = selectedDocId.value as string;
  folder.title = selectedDocTitle.value as string;
};

// Получение цепочки документов с кэшированием
const getChildDocsChain = async (parentId: string): Promise<string[]> => {
  if (expandedChainsCache.value[parentId]) {
    return expandedChainsCache.value[parentId];
  }

  const chain: string[] = [];

  const loadChain = async (id: string) => {
    chain.unshift(id);

    const response = await docStore.getAiDoc(workspaceSlug.value, id);
    if (!response?.data) return;

    const doc = response.data;
    if (doc.parent_doc) {
      await loadChain(doc.parent_doc);
    }
  };

  await loadChain(parentId);

  const finalChain = chain.filter((id): id is string => Boolean(id));

  expandedChainsCache.value[parentId] = finalChain;

  return finalChain;
};

// Функция для рекурсивного раскрытия цепочки документов
const expandChain = async (chain: string[], index: number) => {
  if (index >= chain.length) return;

  const nodeId = chain[index];

  // Загрузить дочерние документы (с кэшем)
  if (!childrenCache.value[nodeId] && nodeId !== folder.id) {
    await lazyLoad({
      key: nodeId,
      done: () => void 0,
    });
  }

  treeRef.value?.setExpanded(nodeId, true);

  await expandChain(chain, index + 1);
};

// Очистка кэшей
const clearExpandedCache = () => {
  expandedChainsCache.value = {};
  childrenCache.value = {};
};

watch(
  () => isOpenTree.value,
  async (newVal) => {
    if (!parentDocId.value || !newVal) return;
    let chain: string[] = [];
    const parentId = isManuallySelected.value ? folder.id : parentDocId.value;
    try {
      isChildDocsLoading.value = true;

      chain = await getChildDocsChain(parentId);
    } finally {
      isChildDocsLoading.value = false;
    }

    await expandChain(chain, 0);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearExpandedCache();
});

onMounted(() => {
  updateSrcDoc(true);
  initParentDoc();
});
</script>

<style scoped lang="scss">
.btn-padding {
  padding: 1px 6px !important;
}
.create-btn {
  &:disabled {
    background-color: #bac4d5 !important;
  }
}

.description-editor {
  :deep(.html-editor__container) {
    min-height: 210px;
    height: 210px;
  }
  :deep(.tiptap) {
    min-height: 210px;
  }
}
@media (min-width: 600px) {
  .q-dialog__inner--minimized > div {
    max-width: 1024px;
  }
}

.tree-custom-header {
  background-color: transparent !important;
}
</style>
