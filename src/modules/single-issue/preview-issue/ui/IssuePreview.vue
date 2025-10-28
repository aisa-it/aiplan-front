<template>
  <q-drawer
    v-model="model"
    side="right"
    class="prevent-preview-side-drawer flex flex-col issue-panel-card hide-scrollbar no-wrap relative-position"
    overlay
    bordered
    :width="adaptiveWidth"
    :breakpoint="0"
    v-click-outside:prevent-preview-side-drawer="{
      isAutoSave: true,
      onClickOutside: () => emits('close'),
      exclude: [...QUASAR_SELECTORS_CLASSES, 'prevent-click-issue-outside'],
    }"
  >
    <div
      v-if="model"
      class="row q-px-sm q-pt-sm flex-center fixed-top"
      style="z-index: 999; background: inherit"
    >
      <h6 class="col q-px-sm">
        {{ issueData.project_detail.identifier }}-{{ issueData.sequence_id }}
      </h6>
      <div class="row justify-end flex q-gutter-sm">
        <q-btn
          class="secondary-btn-only-icon-sm"
          icon="open_in_full"
          @click="emits('open', issueData.id)"
        >
          <HintTooltip>Развернуть</HintTooltip>
        </q-btn>
        <q-btn
          class="secondary-btn-only-icon-sm"
          icon="close"
          @click="emits('close')"
        >
          <HintTooltip>Закрыть</HintTooltip>
        </q-btn>
      </div>
    </div>

    <div
      v-if="model"
      class="flex flex-col full-width full-height no-wrap"
      style="padding-right: 400px; padding-top: 50px"
    >
      <MainIssueInfo preview @update:issue-page="emits('refresh')" />

      <SelectChildren
        :projectid="issueData.project"
        :issueid="issueData.id"
        :is-disabled="hasPermissionByIssue(issueData, project, 'add-sub-issue')"
      />
      <LinkedIssuesPanel />

      <SelectAttachments
        entityType="issue"
        :is-edit="
          hasPermissionByIssue(issueData, project, 'change-issue-secondary')
        "
        :delete-attachment-func="deleteAttachment"
        :get-attachment-func="getAttachmentsList"
        :upload-attachment-func="uploadAttachments"
        :download-all-func="downloadAllAttachments"
        :id="issueData.id"
        ref="selectAttachments"
      />

      <SingleIssueActivity />
    </div>
    <SingleIssueDrawer
      v-if="model"
      preview
      class="fixed-right"
      style="width: 400px; top: 62px"
      @refresh="(v) => emits('refresh', v)"
    />

    <div class="handle-resize" @pointerdown="onPointerDown"></div>
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { LocalStorage, Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// directives
import clickOutside from 'src/directives/click-outside';

// components
import SelectChildren from 'src/modules/single-issue/sub-issues/ui/SubIssuesPanel.vue';
import SelectAttachments from 'src/components/SelectAttachments.vue';
import SingleIssueDrawer from 'src/components/issue-panels/SingleIssueDrawer.vue';
import SingleIssueActivity from 'src/components/issue-panels/SingleIssueActivity.vue';
import LinkedIssuesPanel from '../../linked-issues/ui/LinkedIssuesPanel.vue';
import { FileAttUploadProgressFunc } from 'src/interfaces/files';
import MainIssueInfo from '../../main-issue-info/ui/MainIssueInfo.vue';

// constants
import { QUASAR_SELECTORS_CLASSES } from 'src/constants/quasarSelectorsClasses';

const model = defineModel<boolean>({ default: false });

const emits = defineEmits<{
  refresh: [isFullRefresh?: boolean];
  open: [id: string];
  close: [];
}>();

defineOptions({
  directives: {
    clickOutside,
  },
});

const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const aiplanStore = useAiplanStore();
const workspaceStore = useWorkspaceStore();
const { hasPermissionByIssue } = useRolesStore();

const { currentProjectID, project } = storeToRefs(projectStore);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

let rafId: number | null = null;
const minWidth = computed(() => Math.max(Screen.width / 2, 900));
const maxWidth = computed(() => Screen.width);
const adaptiveWidth = computed(() =>
  Math.min(drawerWidth.value, maxWidth.value),
);

const drawerWidth = ref(Math.max(Screen.width / 2, 900));
const targetWidth = ref(Math.max(Screen.width / 2, 900));
const startX = ref(0);
const startW = ref(0);
const moving = ref(false);

const getAttachmentsList = async () => {
  return await aiplanStore.issueAttachmentsList(
    currentProjectID.value,
    currentIssueID.value,
  );
};

const uploadAttachments = async (
  ev: object,
  onProgress?: FileAttUploadProgressFunc,
) => {
  await aiplanStore.issueAttachmentsUpload(ev, issueData.value.id, onProgress);
};

const deleteAttachment = async (attachmentId: string) => {
  await aiplanStore.issueAttachmentDelete(currentIssueID.value, attachmentId);
};

// заменить на сервис после обновления апи
const downloadAllAttachments = async () => {
  const { data, headers } = await useAiplanStore().api.get(
    ` /api/auth/workspaces/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${currentIssueID.value}/issue-attachments/all/`,
    {
      responseType: 'blob',
    },
  );
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);

  const contentDisposition = headers['content-disposition'];
  const fileNameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
  const fileName = fileNameMatch ? fileNameMatch[1] : 'archive.zip';
  return { url, fileName };
};

const clamp = (w: number) => {
  return Math.min(maxWidth.value, Math.max(minWidth.value, Math.round(w)));
};

const startRaf = () => {
  if (rafId != null) return;
  const tick = () => {
    const cur = drawerWidth.value;
    const tgt = targetWidth.value;
    const diff = tgt - cur;
    const step = diff * 0.22;

    if (Math.abs(diff) < 0.5) {
      drawerWidth.value = tgt;
      rafId = null;
      return;
    }

    drawerWidth.value = cur + step;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
};

const stopRaf = () => {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const onPointerDown = (e: { clientX: number }) => {
  moving.value = true;
  startX.value = e.clientX;
  startW.value = drawerWidth.value;
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp, { once: true });
};

const onPointerMove = (e: { clientX: number }) => {
  if (!moving.value) return;
  const dx = startX.value - e.clientX;
  targetWidth.value = clamp(startW.value + dx);
  startRaf();
};

const onPointerUp = () => {
  moving.value = false;
  window.removeEventListener('pointermove', onPointerMove);
  startRaf();
};

watch(drawerWidth, (val) => {
  LocalStorage.set('drawerWidth', val);
});

onMounted(() => {
  const saved = LocalStorage.getItem('drawerWidth');
  if (saved) {
    drawerWidth.value = Math.max(Number(saved), minWidth.value);
    targetWidth.value = Math.max(Number(saved), minWidth.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove);
  stopRaf();
});
</script>
<style scoped lang="scss">
.handle-resize {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 6px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}
</style>
