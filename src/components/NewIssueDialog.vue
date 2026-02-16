<template>
  <q-dialog ref="dialogRef" :persistent="isPersistent">
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
      v-model:loading="isLoading"
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
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDialogPluginComponent } from 'quasar';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import NewIssuePanel from './NewIssuePanel.vue';
import NewProjectPanel from './NewProjectPanel.vue';
import ConfirmLostEditionDialog from './ConfirmLostEditionDialog.vue';

//types
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ parent?: string; project?: DtoProject }>();
const emit = defineEmits([
  ...useDialogPluginComponent.emits,
  'update',
  'onProjectCreated',
]);

// plugins
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// stores
const workspaceStore = useWorkspaceStore();

// store to ref
const { workspaceProjects } = storeToRefs(workspaceStore);

const isUserTextData = ref(false);
const isConfirm = ref(false);
const isLoading = ref(true);

const isPersistent = computed(() => {
  return !isLoading.value;
});

const handleTextStatus = (status: boolean) => {
  isUserTextData.value = status;
};

const handleClose = () => {
  if (isUserTextData.value && !isLoading.value) {
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
