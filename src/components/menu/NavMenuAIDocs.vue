<template>
  <ExpansionItem
    full-open
    is-default-open
    :itemName="filterBy === 'docs' ? 'rootDocs' : 'favoritesDocs'"
  >
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <DocumentIcon v-if="filterBy === 'docs'" :width="24" :height="24" />
          <StarIcon v-else :width="24" :height="24" color="#F2994A" />
        </q-item-section>

        <q-item-section>
          {{ filterBy === 'docs' ? 'Документы' : 'Избранное' }}
        </q-item-section>

        <MenuActions
          class="q-ml-sm q-mr-sm"
          :items="getHeaderMenuItems()"
          @click.stop
        />
      </div>
    </template>
    <template v-slot:content>
      <q-list
        :style="{
          overflow: 'scroll',
        }"
        class="scrollable-content menu-item--open-full"
      >
        <div
          class="tree-wrapper"
          :class="{ 'tree-wrapper--border': favoritesDocs.length }"
        >
          <div
            v-if="favoritesDocs.length && filterBy === 'favorites'"
            class="favorites-docs"
          >
            <q-list class="favorites-docs__list">
              <q-item
                v-for="item in favoritesDocs"
                :key="item.id"
                clickable
                class="favorites-docs__item"
                :to="`/${route.params.workspace}/aidoc/${item.doc_id}`"
                @click="onSelect(item.doc_id)"
              >
                <div class="favorites-docs__name q-pa-none">
                  <span>{{ item.doc?.title }}</span>

                  <HintTooltip max-width="300px">{{
                    item.doc?.title
                  }}</HintTooltip>
                </div>
                <div class="flex items-center no-wrap q-pa-none">
                  <q-btn
                    class="menu-link__btn q-ml-sm"
                    flat
                    :style="'min-height: 16px !important; min-width: 16px !important; padding: 0'"
                    @click.prevent.stop
                  >
                    <StarIcon
                      :width="16"
                      :height="16"
                      :color="'#F2994A'"
                      @click="deleteDocFromFavorites(item.doc_id)"
                    />
                    <HintTooltip>Убрать из избранного</HintTooltip>
                  </q-btn>
                  <MenuActions
                    :items="
                      getAidocMenuItems(
                        item.doc_id,
                        item.doc?.short_url,
                        item.doc,
                      )
                    "
                    @click.stop
                  />
                </div>
              </q-item>
            </q-list>
          </div>

          <q-tree
            v-if="treeNode.length && filterBy === 'docs'"
            ref="treeRef"
            :nodes="treeNode"
            node-key="id"
            label-key="title"
            style="user-select: none"
            :selected="selectedId"
            @update:selected="onSelect"
            @lazy-load="lazyLoad"
          >
            <template v-slot:default-header="prop">
              <q-item
                class="tree-custom-header justify-between q-pa-none"
                :active="prop.key === route.params.doc"
              >
                <div class="tree-custom-header__name">
                  <span>{{ prop.node.title }}</span>
                  <HintTooltip max-width="270px">{{
                    prop.node.title
                  }}</HintTooltip>
                </div>
                <div class="flex align-center no-wrap">
                  <q-btn
                    class="menu-link__btn q-ml-sm"
                    :class="{ 'favorite-btn--inactive': !prop.node.isFavorite }"
                    flat
                    :style="'min-height: 16px !important; min-width: 16px !important; padding: 0'"
                    @click.prevent.stop
                  >
                    <StarIcon
                      :width="16"
                      :height="16"
                      :color="getFavIconColor(prop.node.isFavorite)"
                      @click="
                        () =>
                          prop.node.isFavorite
                            ? deleteDocFromFavorites(prop.node.id)
                            : addDocToFavorites(prop.node.id)
                      "
                    />
                    <HintTooltip v-if="prop.node.isFavorite"
                      >Убрать из избранного</HintTooltip
                    >
                    <HintTooltip v-else>Добавить в избранное</HintTooltip>
                  </q-btn>
                  <MenuActions
                    :items="
                      getAidocMenuItems(
                        prop.node.id,
                        prop.node.doc?.short_url,
                        prop.node,
                      )
                    "
                    @click.stop
                  />
                </div>
              </q-item>
            </template>
          </q-tree>
        </div>
      </q-list>

      <AidocRulesDialog
        v-model="isRulesDialogOpen"
        :roles="{
          editor_role: docInfo.editor_role,
          reader_role: docInfo.reader_role,
          reader_ids: docInfo.reader_ids,
          editor_ids: docInfo.editor_ids,
        }"
        :isAdminOrAuthor="isAdminOrAuthor"
        @update:roles="(val) => updateDocument(val)"
      />

      <AidocWatchersDialog
        v-model="isWatchersDialogOpen"
        :can-edit="canEdit"
        :loading="loading"
        :doc-id="docInfo.id"
        :watchers="docInfo.watchers"
        @refresh="getDocInfo(docInfo.id)"
      />

      <NotificationsSettingsDialog
        v-model="isNotificationsSettingsOpen"
        is-aidoc-page
      />
      <HierarchyDocDialog
        v-if="filterBy === 'docs'"
        v-model="isHierarchyDialogOpen"
      />
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
// core
import { onMounted, ref, watch, nextTick, computed } from 'vue';
import { QTree } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

// store
import { storeToRefs } from 'pinia';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { findObjectByValue } from 'src/stores/recursionObject';

import ExpansionItem from '../ExpansionItem.vue';
import MenuActions from './MenuActions.vue';

import AidocRulesDialog from 'src/components/aidoc/AidocRulesDialog.vue';
import AidocWatchersDialog from 'src/components/aidoc/AidocWatchersDialog.vue';
import NotificationsSettingsDialog from '../dialogs/NotificationsSettingsDialog.vue';
import HierarchyDocDialog from '../dialogs/AIDocDialogs/HierarchyDocDialog.vue';

import BellIcon from '../icons/BellIcon.vue';
import LinkIcon from '../icons/LinkIcon.vue';
import ManageAccountsIcon from '../icons/ManageAccountsIcon.vue';
import VisibilityIcon from '../icons/VisibilityIcon.vue';
import StarIcon from 'src/components/icons/StarIcon.vue';
import DocumentIcon from '../icons/DocumentIcon.vue';

import { mapDocNode } from 'src/utils/tree';
import {
  SUCCESS_ADD_DOC_TO_FAVORITE,
  SUCCESS_REMOVE_DOC_FROM_FAVORITE,
  BASE_ERROR,
  ERROR_COPY_LINK_TO_CLIPBOARD,
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
  SUCCESS_UPDATE_DOCUMENT,
} from 'src/constants/notifications';
import { IDocTreeNode } from 'src/interfaces/docs';

const emits = defineEmits<{
  updateFavoriteState: [id: string, state: boolean];
}>();

const props = defineProps<{
  filterBy: 'favorites' | 'docs';
}>();

const router = useRouter();
const route = useRoute();
// stores
const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const userStore = useUserStore();
const { setNotificationView } = useNotificationStore();
const { hasPermission } = useRolesStore();
// store to refs
const { currentWorkspaceSlug, workspaceInfo } = storeToRefs(workspaceStore);
const { user } = storeToRefs(userStore);
const {
  rootDocs,
  newChildrenDoc,
  newRootDoc,
  parentDocId,
  deletedDocId,
  updatedDocId,
  selectedDocTitle,
  favoritesDocs,
  isHierarchyOpened,
} = storeToRefs(docStore);

const treeRef = ref<QTree | null>();
const selectedId = ref('');
const treeNode = ref<IDocTreeNode[]>([]);
const isRulesDialogOpen = ref<boolean>(false);
const isWatchersDialogOpen = ref<boolean>(false);
const isNotificationsSettingsOpen = ref<boolean>(false);
const isHierarchyDialogOpen = ref<boolean>(false);
const docInfo = ref({});
const loading = ref(false);

const currentUserRole = computed(() => {
  return workspaceInfo.value?.current_user_membership?.role ?? 0;
});

const isAdminOrAuthor = computed(() => {
  return (
    hasPermission('change-issue-primary') ||
    docInfo.value?.author?.id === user.value.id
  );
});

const canEdit = computed(() => {
  return (
    currentUserRole.value >= docInfo.value?.editor_role ||
    docInfo.value?.editor_ids?.includes(user.value.id) ||
    isAdminOrAuthor.value
  );
});

const getRootDocs = async () => {
  if (currentWorkspaceSlug?.value) {
    await docStore.getRootDocs(currentWorkspaceSlug.value);
  }
  setRootDocs();
};

const setRootDocs = () => {
  treeNode.value = rootDocs.value.map(mapDocNode);
};

const onSelect = (id: string | null = null) => {
  let idPath: string | undefined;

  if (!id) {
    const arrayRoute = router.currentRoute.value.path.split('/');
    if (arrayRoute.length > 2) {
      idPath = arrayRoute[3];
    }
  }
  const currentId = id || idPath;
  if (!currentId) {
    return;
  }
  const currentDoc = findObjectByValue(treeNode.value, 'id', currentId);
  if (!currentDoc) {
    return;
  }
  docStore.selectDoc(currentDoc.id, currentDoc.title);
  if (id) {
    router.push({ path: `/${currentWorkspaceSlug?.value}/aidoc/${id}` });
  }
};

const lazyLoad = async ({
  key,
  done,
}: {
  key: string;
  done: (children?: readonly any[]) => void;
}) => {
  if (!currentWorkspaceSlug || !currentWorkspaceSlug.value) return;
  const children = (
    await docStore.getChildDocList(currentWorkspaceSlug.value, key)
  ).data;
  done(children.map(mapDocNode));
};

const getFavoriteDocs = async () => {
  await docStore.getFavoriteDocs(currentWorkspaceSlug.value);
};

const getFavIconColor = (isFavorite: boolean) => {
  return isFavorite ? '#F2994A' : '';
};

const setFavoriteState = (id: string, state: boolean) => {
  const node = treeRef.value?.getNodeByKey(id);
  if (node) node.isFavorite = state;
};

const addDocToFavorites = async (id: string) => {
  await docStore
    .addDocToFavorites(currentWorkspaceSlug.value, id)
    .then(() => {
      getFavoriteDocs();
      setFavoriteState(id, true);
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_ADD_DOC_TO_FAVORITE,
      });
    })
    .catch(() => {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: BASE_ERROR,
      });
    });
};

const deleteDocFromFavorites = async (id: string) => {
  await docStore
    .deleteDocFromFavorites(currentWorkspaceSlug.value, id)
    .then(() => {
      getFavoriteDocs();
      if (props.filterBy === 'docs') {
        setFavoriteState(id, false);
      } else if (props.filterBy === 'favorites') {
        emits('updateFavoriteState', id, false);
      }
      setFavoriteState(id, false);
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_REMOVE_DOC_FROM_FAVORITE,
      });
    })
    .catch(() => {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: BASE_ERROR,
      });
    });
};

const getDocInfo = async (id: string) => {
  try {
    loading.value = true;
    const { data } = await docStore.getAiDoc(
      route.params.workspace as string,
      id,
    );
    docInfo.value = { ...data };
  } finally {
    loading.value = false;
  }
};

const openRulesDialog = async (id: string) => {
  await getDocInfo(id);
  isRulesDialogOpen.value = true;
};

const openWatchersDialog = async (id: string) => {
  await getDocInfo(id);
  isWatchersDialogOpen.value = true;
};

const openHierarchyDocDialog = (): void => {
  isHierarchyDialogOpen.value = true;
  docStore.isHierarchyOpened = true;
};

const updateDocument = async (roles = {}) => {
  try {
    await docStore.updateDocument(
      {
        doc: {
          reader_role: roles.reader_role ?? undefined,
          editor_role: roles.editor_role ?? undefined,
          reader_list: roles.reader_ids ?? undefined,
          editor_list: roles.editor_ids ?? undefined,
        },
      },
      currentWorkspaceSlug.value,
      docInfo.value?.id,
    );
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_UPDATE_DOCUMENT,
    });
  } catch (e) {}
};

const copyLink = async (short_url: string | undefined, document: any) => {
  try {
    short_url
      ? await navigator.clipboard.writeText(short_url)
      : await navigator.clipboard.writeText(
          `${location.protocol}//${location.host}/d/${currentWorkspaceSlug.value}/${document.id}`,
        );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_COPY_LINK_TO_CLIPBOARD,
    });
  } catch (err) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: ERROR_COPY_LINK_TO_CLIPBOARD,
    });
  }
};

const getHeaderMenuItems = () => {
  if (props.filterBy === 'docs') {
    return [
      {
        text: 'Настроить уведомления',
        icon: BellIcon,
        onClick: () => {
          isNotificationsSettingsOpen.value = true;
        },
      },
      {
        text: 'Изменить порядок иерархии',
        icon: BellIcon,
        onClick: () => openHierarchyDocDialog(),
      },
    ];
  } else {
    return [
      {
        text: 'Настроить уведомления',
        icon: BellIcon,
        onClick: () => {
          isNotificationsSettingsOpen.value = true;
        },
      },
    ];
  }
};

const getAidocMenuItems = (
  docId: string | undefined,
  shortUrl: string | undefined,
  document: any,
) => {
  if (!docId) return [];
  return [
    {
      text: 'Права доступа',
      icon: ManageAccountsIcon,
      onClick: () => {
        openRulesDialog(docId);
      },
    },
    {
      text: 'Наблюдатели',
      icon: VisibilityIcon,
      onClick: () => {
        openWatchersDialog(docId);
      },
    },
    {
      text: 'Скопировать ссылку',
      icon: LinkIcon,
      onClick: () => {
        copyLink(shortUrl, document);
      },
    },
  ];
};

watch(
  () => newChildrenDoc.value,
  async (newChildrenDoc) => {
    if (newChildrenDoc && currentWorkspaceSlug?.value) {
      const node = treeRef.value?.getNodeByKey(newChildrenDoc.parent_doc);
      if (!node) return;
      if (node?.children) node.children.push(mapDocNode(newChildrenDoc));
      else node.children = [mapDocNode(newChildrenDoc)];
    }
  },
);

watch(
  () => newRootDoc.value,
  (newRootDoc) => {
    if (newRootDoc) treeNode.value.push(mapDocNode(newRootDoc));
  },
);

watch(
  () => deletedDocId.value,
  (docId) => {
    if (docId && props.filterBy === 'docs') {
      if (parentDocId.value) {
        const node = treeRef.value?.getNodeByKey(parentDocId.value);
        if (!node) return;
        delete node.children;
        treeRef.value?.setExpanded(parentDocId.value, false);
        nextTick(() => {
          treeRef.value?.setExpanded(parentDocId.value, true);
        });
      } else {
        treeNode.value = treeNode.value.filter((doc) => doc.id !== docId);
      }
      getFavoriteDocs();
    }
  },
);

watch(
  () => updatedDocId.value,
  (docId) => {
    if (docId) {
      getFavoriteDocs();
      if (parentDocId.value) {
        const node = treeRef.value?.getNodeByKey(docId);
        if (node) node.title = selectedDocTitle.value;
      } else {
        getRootDocs();
      }
    }
  },
);

watch(
  () => isHierarchyOpened.value,
  (newVal) => {
    if (!newVal) {
      setRootDocs();
    }
  },
);

watch(
  () => [isRulesDialogOpen.value, isWatchersDialogOpen.value],
  ([newValRules, newValWatchers]) => {
    if (!newValRules && !newValWatchers) {
      docInfo.value = {};
    }
  },
);

onMounted(async () => {
  if (props.filterBy === 'favorites') await getFavoriteDocs();
  if (props.filterBy === 'docs') await getRootDocs();
  onSelect();
});

defineExpose({
  setFavoriteState,
});
</script>

<style scoped lang="scss">
.tree-wrapper {
  height: 100%;
  padding: 0 10px 10px 8px;
}

.tree-custom-header {
  cursor: default;

  &__name {
    display: flex;
    > span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 195px;
    }
  }
}

.favorite-btn--inactive {
  opacity: 0;
  visibility: hidden;
  @media (max-width: 768px) {
    opacity: 1;
    visibility: visible;
  }
}
.tree-custom-header:hover .favorite-btn--inactive {
  opacity: 1;
  visibility: visible;
}

.favorites-docs {
  padding: 3px 0;

  &__list {
    padding: 0 0 0 12px;
    margin-bottom: 3px;
  }
  &__title {
    min-height: 0;
    font-weight: 600;
    margin-top: 5px;
    span {
      padding: 4px;
    }
  }
  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 0;
    border-radius: 4px;
    padding: 4px;
    margin: 3px 0 0;
    cursor: default !important;
    &:hover .q-focus-helper {
      background-color: $hover-color;
    }
  }
  &__name {
    display: flex;
    width: 100%;
    > span {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 210px;
    }
  }
}
</style>
