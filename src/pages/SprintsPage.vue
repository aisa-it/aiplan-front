<template>
  <div class="px-4 pb-4 pt-6">
    <header class="mb-3 flex items-center justify-between gap-3">
      <h1 class="min-w-0 wrap-break-word text-2xl font-normal sm:text-[34px]">
        {{ t('sprints.overview.title', { workspace: workspaceSlug }) }}
      </h1>
      <ActionMenu
        v-if="canCreateFolder"
        :items="createMenuItems"
        location="bottom end"
        plain
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="text"
            icon
            variant="text"
            size="x-small"
            :aria-label="t('common.actions.create')"
            :disabled="loading"
          >
            <PlusIcon />
          </v-btn>
        </template>
      </ActionMenu>
    </header>

    <v-progress-linear v-if="loading && !folders.length" indeterminate color="primary" />
    <div v-if="loadFailed" class="flex flex-wrap items-center gap-2 py-4">
      <p role="status">{{ t('sprints.overview.loadError') }}</p>
      <v-btn variant="text" color="primary" @click="load">
        {{ t('issues.groups.retry') }}
      </v-btn>
    </div>
    <p v-else-if="!loading && !folders.length" class="py-4">
      {{ t('sprints.overview.empty') }}
    </p>

    <section v-for="folder in folders" :key="folder.id">
      <div
        class="sprint-folder-heading flex min-h-12 items-center pr-4"
        :class="{ 'sprint-folder-heading--open': expanded.includes(folder.id) }"
        @contextmenu="openFolderMenu($event, folder)"
      >
        <component
          :is="folder.sprints.length ? 'button' : 'div'"
          :type="folder.sprints.length ? 'button' : undefined"
          :aria-expanded="folder.sprints.length ? expanded.includes(folder.id) : undefined"
          class="flex min-h-12 min-w-0 flex-1 items-center gap-4 px-5 text-start font-semibold"
          :class="{ 'cursor-pointer': folder.sprints.length }"
          @click="toggleFolder(folder)"
        >
          <span
            class="inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1 text-xs font-normal"
            :class="folder.id === ROOT_SPRINT_FOLDER_ID
              ? 'bg-[#bac4d5] text-[#474a52]'
              : 'bg-primary-light text-[#3f75ff]'"
          >
            {{ folder.sprints.length }}
          </span>
          <span class="min-w-0 flex-1 wrap-break-word">
            {{ folder.id === ROOT_SPRINT_FOLDER_ID ? t('sprints.overview.noFolder') : folder.name }}
          </span>
          <v-icon
            v-if="folder.sprints.length"
            :icon="expanded.includes(folder.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            size="20"
          />
        </component>
      </div>
      <v-expand-transition>
        <SprintFolderTable
          v-if="expanded.includes(folder.id) && folder.sprints.length"
          v-model:sort-by="folderSort[folder.id]"
          :sprints="folder.sprints"
          :workspace-slug="workspaceSlug"
          :column-resize="columnResize"
          @menu="(event, sprint) => openMenu(event, { type: 'sprint', sprint, folderId: folder.id })"
        />
      </v-expand-transition>
    </section>

    <CursorActionMenu v-model="menuOpen" :target="menuTarget" :items="menuItems" />

    <SprintOverviewDialog
      :key="`move:${workspaceSlug}`"
      v-model="moveAction"
      :workspace-slug="workspaceSlug"
      :folders="folders"
      :can-create-folder="canCreateFolder"
      @folder-action="action = $event"
      @saved="onSaved"
    />
    <SprintOverviewDialog
      :key="workspaceSlug"
      v-model="action"
      :workspace-slug="workspaceSlug"
      :folders="folders"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onScopeDispose, reactive, ref, shallowRef, watch } from 'vue';
import { useEventBus } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { SortItem } from 'vuetify/lib/components/VDataTable/composables/sort.js';
import ActionMenu from '@/components/menus/ActionMenu.vue';
import CursorActionMenu from '@/components/menus/CursorActionMenu.vue';
import CopyNameIcon from '@/components/icons/CopyNameIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import SettingsIcon from '@/components/icons/MenuSettingsIcon.vue';
import OpenNewTabIcon from '@/components/icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from '@/components/icons/OpenNewWindowIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import BinIcon from '@/components/sidebar/icons/BinIcon.vue';
import { useIssueColumnResize } from '@/modules/issues/composables/useIssueColumnResize';
import { sprintDeletedKey, sprintService } from '@/modules/sprints/api/sprint.service';
import SprintFolderTable from '@/modules/sprints/components/SprintFolderTable.vue';
import SprintOverviewDialog from '@/modules/sprints/components/SprintOverviewDialog.vue';
import CopyLinkIcon from '@/modules/sprints/icons/CopyLinkIcon.vue';
import FolderAddIcon from '@/modules/sprints/icons/FolderAddIcon.vue';
import {
  ROOT_SPRINT_FOLDER_ID,
  type SprintFolder,
  type SprintOverviewAction,
} from '@/modules/sprints/model/sprint-folders';
import { toast } from '@/modules/toast';
import { useUserStore } from '@/stores/user-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { checkPermissionByWs } from '@/utils/permissions';

type MenuContext =
  | { type: 'folder'; folder: SprintFolder }
  | { type: 'sprint'; sprint: DtoSprintLight & { id: string }; folderId: string };

const props = defineProps<{ workspaceSlug: string }>();
const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const folders = shallowRef<SprintFolder[]>([]);
const expanded = ref<string[]>([]);
const folderSort = reactive<Record<string, SortItem[]>>({});
const loading = ref(false);
const loadFailed = ref(false);
const action = shallowRef<SprintOverviewAction | null>(null);
const moveAction = shallowRef<SprintOverviewAction | null>(null);
const menuContext = shallowRef<MenuContext>();
const menuOpen = ref(false);
const menuTarget = shallowRef<[number, number]>();
let request: AbortController | undefined;

const canCreateFolder = computed(() => checkPermissionByWs(userStore.workspaceRoleName, 'create-sprint'));
const canEditSprint = computed(() => checkPermissionByWs(userStore.workspaceRoleName, 'edit-sprint'));
const canManageFolders = computed(() => checkPermissionByWs(userStore.workspaceRoleName, 'edit-sprint-folders'));
const canDeleteSprint = computed(() => checkPermissionByWs(userStore.workspaceRoleName, 'delete-sprint'));
const createMenuItems = computed(() => [
  { label: t('sidebar.createSprint') },
  {
    label: t('sprints.overview.createFolder'),
    onClick: () => (action.value = { type: 'createFolder' }),
  },
]);
const columnResize = useIssueColumnResize(
  () => `sprints:${props.workspaceSlug}`,
  (key) => key === 'name' || key === 'progress',
);

function sprintHref(id: string) {
  return router.resolve({
    name: 'sprint',
    params: { workspace: props.workspaceSlug, sprint: id },
  }).href;
}

function sprintNameWithDates({ name, start_date, end_date }: DtoSprintLight) {
  if (!start_date || !end_date) return name ?? '';
  const shortDate = (date: string) => `${date.slice(8, 10)}.${date.slice(5, 7)}`;
  return [name, `(${shortDate(start_date)} - ${shortDate(end_date)})`].filter(Boolean).join(' ');
}

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(t('sprints.overview.copied'));
  } catch {
    toast.error(t('sprints.overview.copyError'));
  }
}

const menuItems = computed(() => {
  const context = menuContext.value;
  if (!context) return [];
  if (context.type === 'folder') {
    const { id, name = '', sprints } = context.folder;
    return [
      {
        label: t('sprints.overview.renameFolder'),
        icon: EditIcon,
        onClick: () => (action.value = { type: 'renameFolder', id, name }),
      },
      {
        label: t('sprints.overview.deleteFolder'),
        icon: BinIcon,
        destructive: true,
        disabled: sprints.length > 0,
        disabledTooltip: sprints.length ? t('sprints.overview.onlyEmptyFolderCanBeDeleted') : undefined,
        onClick: () => (action.value = { type: 'deleteFolder', id, name }),
      },
    ];
  }

  const { id, name = '', short_url, url } = context.sprint;
  const href = short_url || url || sprintHref(id);
  return [
    ...(canEditSprint.value ? [{
      label: t('sidebar.projectSettings'),
      icon: SettingsIcon,
    }] : []),
    ...(canManageFolders.value ? [{
      label: t('sprints.overview.addToFolder'),
      icon: FolderAddIcon,
      onClick: () => (moveAction.value = { type: 'moveSprint', id, name, folderId: context.folderId }),
    }] : []),
    {
      label: t('sidebar.copyLink'),
      icon: CopyLinkIcon,
      onClick: () => void copy(new URL(href, location.href).href),
    },
    {
      label: t('common.actions.openNewTab'),
      icon: OpenNewTabIcon,
      onClick: () => window.open(href, '_blank', 'noopener'),
    },
    {
      label: t('common.actions.openNewWindow'),
      icon: OpenNewWindowIcon,
      onClick: () => window.open(href, '_blank', 'popup,noopener'),
    },
    { label: t('common.actions.copyName'), icon: CopyNameIcon, onClick: () => void copy(name) },
    ...(canDeleteSprint.value ? [{
      label: t('common.actions.delete'),
      icon: BinIcon,
      destructive: true,
      onClick: () => (action.value = { type: 'deleteSprint', id, name: sprintNameWithDates(context.sprint) }),
    }] : []),
  ];
});

function openMenu(event: MouseEvent, context: MenuContext) {
  menuOpen.value = false;
  menuContext.value = context;
  menuTarget.value = [event.clientX, event.clientY];
  void nextTick(() => {
    if (menuContext.value === context) menuOpen.value = true;
  });
}

function openFolderMenu(event: MouseEvent, folder: SprintFolder) {
  if (!canManageFolders.value || folder.id === ROOT_SPRINT_FOLDER_ID) return;
  event.preventDefault();
  openMenu(event, { type: 'folder', folder });
}

function toggleFolder(folder: SprintFolder) {
  if (!folder.sprints.length) return;
  expanded.value = expanded.value.includes(folder.id)
    ? expanded.value.filter((id) => id !== folder.id)
    : [...expanded.value, folder.id];
}

async function load() {
  request?.abort();
  const controller = new AbortController();
  request = controller;
  loading.value = true;
  loadFailed.value = false;
  try {
    const result = await sprintService.list(props.workspaceSlug, controller.signal);
    if (controller.signal.aborted) return;
    folders.value = result.flatMap((folder): SprintFolder[] => {
      if (!folder.id || (folder.id === ROOT_SPRINT_FOLDER_ID && !folder.sprints?.length)) return [];
      return [{ ...folder, id: folder.id, sprints: folder.sprints ?? [] }];
    });
    const hasRows = new Set(folders.value.filter(({ sprints }) => sprints.length).map(({ id }) => id));
    expanded.value = expanded.value.filter((id) => hasRows.has(id));
  } catch {
    if (!controller.signal.aborted) loadFailed.value = true;
  } finally {
    if (!controller.signal.aborted) loading.value = false;
  }
}

function onSaved(workspace: string, savedAction: SprintOverviewAction) {
  if (workspace !== props.workspaceSlug) return;
  if (savedAction.type !== 'deleteSprint') void load();
  void workspaceStore.getWorkspaceSummary(workspace).catch(() => {});
}

useEventBus(sprintDeletedKey).on((workspace) => {
  if (workspace === props.workspaceSlug) void load();
});

watch(() => props.workspaceSlug, () => {
  folders.value = [];
  expanded.value = [];
  for (const id of Object.keys(folderSort)) delete folderSort[id];
  action.value = null;
  moveAction.value = null;
  menuOpen.value = false;
  menuContext.value = undefined;
  void load();
}, { immediate: true });

onScopeDispose(() => request?.abort());
</script>

<style scoped>
.sprint-folder-heading:hover,
.sprint-folder-heading:focus-within,
.sprint-folder-heading--open {
  background-color: rgba(var(--v-theme-on-background), 0.12);
}

</style>
