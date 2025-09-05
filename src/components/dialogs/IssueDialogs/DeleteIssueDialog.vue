<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление задачи</h6>
        <span>
          Вы уверены, что хотите удалить задачу
          <b>"{{ props.issue ? props.issue.name : issueData.name }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          class="delete-btn"
          @click="handleDeleteIssue"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

import { getSuccessDeleteIssueMessage } from 'src/utils/notifications';

const props = defineProps<{
  issue: any;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

// store
const projectStore = useProjectStore();
const issueStore = useSingleIssueStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
// store to refs
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { issueData } = storeToRefs(issueStore);

const router = useRouter();

const handleDeleteIssue = async () => {
  await issueStore
    .deleteIssue(
      currentWorkspaceSlug.value,
      currentProjectID.value,
      props.issue ? props.issue.sequence_id : issueData.value.id,
    )
    .then(() => {
      router.push(
        `/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues`,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: getSuccessDeleteIssueMessage(
          `${
            props.issue
              ? props.issue.project_detail.identifier
              : issueData.value.project_detail.identifier
          }-${
            props.issue ? props.issue.sequence_id : issueData.value.sequence_id
          }`,
        ),
      });
      if (props.issue) emit('refresh');
    })
    .catch(() => {
      router.push(
        `/${currentWorkspaceSlug.value}/projects/${
          currentProjectID.value
        }/issues/${
          props.issue ? props.issue.sequence_id : issueData.value.sequence_id
        }`,
      );
    });
};
</script>
