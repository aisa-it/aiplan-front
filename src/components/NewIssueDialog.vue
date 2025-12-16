<template>
  <q-dialog ref="dialogRef" persistent>
    <NewIssuePanel
      v-if="workspaceProjects"
      :project_detail="project"
      :parentissue="parent"
      class="q-dialog-plugin"
      style="min-width: 80vw"
      @ok="
        () => {
          $emit('update');
          onDialogOK();
        }
      "
      @onCancel="handleClose"
      :isUserTextData="isUserTextData"
      @changeTextStatus="handleTextStatus"
    />

    <NewProjectPanel
      v-else
      class="q-dialog-plugin"
      style="min-width: 50vw"
      @cancel="handleClose"
      @handle-create-project="createProject"
    />
    <ConfirmLostEditionDialog
      v-model="isConfirm"
      @closeIssue="closeBothDialog"
      @closeConfirm="
        () => {
          isConfirm = false;
        }
      "
    />
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDialogPluginComponent } from 'quasar';

// stores
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import NewIssuePanel from './NewIssuePanel.vue';
import NewProjectPanel from './NewProjectPanel.vue';
import ConfirmLostEditionDialog from './ConfirmLostEditionDialog.vue';
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ parent?: string; project?: DtoProject }>();
const emit = defineEmits([
  ...useDialogPluginComponent.emits,
  'update',
  'onProjectCreated',
]);

// plugins
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

// stores
const api = useAiplanStore();
const workspaceStore = useWorkspaceStore();

// store to ref
const { workspaceProjects, currentWorkspaceSlug } = storeToRefs(workspaceStore);

const data = ref({});
const isUserTextData = ref(false);
const isConfirm = ref(false);

const handleTextStatus = (status) => {
  isUserTextData.value = status;
};

const handleClose = () => {
  if (isUserTextData.value) {
    isConfirm.value = true;
  } else {
    onDialogCancel();
  }
};
const closeBothDialog = () => {
  isConfirm.value = false;
  onDialogCancel();
};

const createProject = () => {
  onDialogCancel();
  emit('onProjectCreated');
};
</script>
