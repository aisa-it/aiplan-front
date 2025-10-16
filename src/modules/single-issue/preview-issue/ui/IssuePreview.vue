<template>
  <q-drawer
    v-model="model"
    side="right"
    class="issue-side-drawer q-ml-sm issue-panel-card hide-scrollbar"
    overlay
    bordered
    content-class="relative"
    :width="drawerWidth"
    :breakpoint="0"
  >
    <SingleIssueDrawer v-if="model" @refresh="emits('refresh')">
      <template #extend-buttons>
        <div class="row justify-end flex q-gutter-sm">
          <q-btn
            class="secondary-btn-only-icon"
            icon="open_in_full"
            @click="emits('open', issueData.id)"
          >
            <HintTooltip>Расширить</HintTooltip>
          </q-btn>
          <q-btn class="secondary-btn-only-icon" icon="close" @click="onClose">
            <HintTooltip>Закрыть</HintTooltip>
          </q-btn>
        </div>
      </template>
      <template #extend-header>
        <MainIssueInfo preview @update:issue-page="emits('refresh')" />
      </template>
      <template #extend-content>
        <div style="margin-right: -8px">
          <SelectChildren
            :projectid="issueData.project"
            :issueid="issueData.id"
            :is-disabled="
              hasPermissionByIssue(issueData, project, 'add-sub-issue')
            "
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
          />

          <SingleIssueActivity />
        </div>
      </template>
    </SingleIssueDrawer>
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

// components
import SelectChildren from 'src/modules/single-issue/sub-issues/ui/SubIssuesPanel.vue';
import SelectAttachments from 'src/components/SelectAttachments.vue';
import SingleIssueDrawer from 'src/components/issue-panels/SingleIssueDrawer.vue';
import SingleIssueActivity from 'src/components/issue-panels/SingleIssueActivity.vue';
import LinkedIssuesPanel from '../../linked-issues/ui/LinkedIssuesPanel.vue';
import { FileAttUploadProgressFunc } from 'src/interfaces/files';
import MainIssueInfo from '../../main-issue-info/ui/MainIssueInfo.vue';

const model = defineModel<boolean>({ default: false });

const emits = defineEmits<{
  refresh: [];
  open: [id: string];
}>();

const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const aiplanStore = useAiplanStore();
const workspaceStore = useWorkspaceStore();
const { hasPermissionByIssue } = useRolesStore();

const { currentProjectID, project } = storeToRefs(projectStore);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const MIN_W = 400;
const MAX_W = computed(() => Screen.width / 2);
let rafId: number | null = null;

const drawerWidth = ref(400);
const targetWidth = ref(400);
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

const onClose = () => {
  model.value = false;
  currentIssueID.value = '';
};

const clamp = (w: number) => {
  return Math.min(MAX_W.value, Math.max(MIN_W, Math.round(w)));
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
    drawerWidth.value = Number(saved);
    targetWidth.value = Number(saved);
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
