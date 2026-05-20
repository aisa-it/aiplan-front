<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">
          {{ isUnarchive ? 'Разархивировать' : 'Добавить в архив' }}
          {{ ` проект` }}
          {{ project?.name }}?
        </h6>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup style="width: 110px" />
        <q-btn
          flat
          no-caps
          class="btn primary-btn"
          :label="isUnarchive ? 'Разархивировать' : 'В архив'"
          :style="{ width: isUnarchive ? '210px' : '110px' }"
          v-close-popup
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// store
import { useWorkspaceStore } from 'src/stores/workspace-store';

// icons
import CancelButton from 'src/components/buttons/CancelButton.vue';

// constants
import { storeToRefs } from 'pinia';
import { useLoadProjectInfo } from 'src/modules/issue-list/composables/useLoadProjectInfo';
import { useProjectStore } from 'src/stores/project-store';

const props = defineProps<{
  project: DtoProjectLight | null,
  isUnarchive?: boolean,
}>();
const emits = defineEmits<{ success: []; error: [] }>();

const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { getProjectInfo } = useLoadProjectInfo();
const { currentProjectID } = storeToRefs(projectStore);


const handleConfirm = async (): Promise<void> => {
  try {
    if (props.isUnarchive) {
      await workspaceStore.unarchiveProject(currentWorkspaceSlug.value, props.project?.id);
    } else {
      await workspaceStore.archiveProject(currentWorkspaceSlug.value, props.project?.id);
    }

    emits('success');

    workspaceStore.getWorkspaceArchivedProjects(currentWorkspaceSlug.value as string);
    workspaceStore.getWorkspaceProjects(currentWorkspaceSlug.value as string);
    if(props.project?.id ===  currentProjectID.value || props.project?.identifier === currentProjectID.value) {
      getProjectInfo();
    }
  } catch(error) {
    console.error(error);
    emits('error');
  }
};
</script>
