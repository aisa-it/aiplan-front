<template>
  <q-card>
    <q-toggle
      v-model="isManualSort"
      size="md"
      keep-color
      label="Ручная сортировка"
      v-show="
        props.subIssues.length > 1 &&
        hasPermissionByIssue(
          issueData,
          props.project_detail ?? project,
          'change-issue-primary',
        )
      "
    />
    <q-list class="issue-subtask__list" dense bordered separator>
      <q-item
        v-for="subIssue in props.subIssues"
        :key="subIssue.id"
        clickable
        v-ripple
        class="issue-subtask__item border-light"
      >
        <q-item-section>
          <router-link
            :target="user.theme.open_in_new ? '_blank' : ''"
            style="color: inherit; text-decoration: none"
            :to="getUrl(subIssue)"
          >
            <q-item-label>
              <q-badge
                rounded
                class="q-mr-xs"
                :style="{ backgroundColor: subIssue.state_detail.color }"
                ><HintTooltip>{{
                  subIssue.state_detail.name
                }}</HintTooltip></q-badge
              >
              {{ subIssue.project_detail.identifier }}-{{
                subIssue.sequence_id
              }}

              <span class="subissue-name">
                {{ subIssue.name }}
              </span>
            </q-item-label>
          </router-link>
        </q-item-section>
        <q-item-section side
          ><div>
            <q-btn
              v-show="props.manualSortMode"
              flat
              icon="expand_less"
              dense
              size="xs"
              @click="moveChildUp(subIssue.id)"
            />
            <q-btn
              v-show="props.manualSortMode"
              flat
              icon="expand_more"
              dense
              size="xs"
              @click="moveChildDown(subIssue.id)"
            />
            <q-btn
              v-if="canDelete(subIssue)"
              flat
              icon="close"
              dense
              size="xs"
              @click="removeChild(subIssue.id)"
            /></div
        ></q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';
// api
import { updateIssueInfo } from '../../services/api';
import { moveSubIssueDown, moveSubIssueUp } from '../services/api';
import { SUCCESS_DELETE_SUBISSUE } from 'src/constants/notifications';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const userStore = useUserStore();
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const { hasPermissionByIssue } = useRolesStore();
const { setNotificationView } = useNotificationStore();
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { user } = storeToRefs(userStore);
const { project } = storeToRefs(projectStore);

const route = useRoute();
const props = defineProps(['subIssues', 'manualSortMode', 'project_detail']);
const emits = defineEmits(['refresh', 'toggleSortMode']);

const isManualSort = computed({
  get: () => props.manualSortMode,
  set: (val: boolean) => emits('toggleSortMode', val),
});

const moveChildUp = async (id: string) => {
  await moveSubIssueUp(
    route.params.workspace as string,
    props.project_detail.id ?? (route.params.project as string),
    currentIssueID.value as string,
    id,
  );
  emits('refresh');
};

const moveChildDown = async (id: string) => {
  await moveSubIssueDown(
    route.params.workspace as string,
    props.project_detail.id ?? (route.params.project as string),
    currentIssueID.value as string,
    id,
  );
  emits('refresh');
};

const getUrl = (value: DtoIssue) => {
  return `/${value.workspace_detail?.slug}/projects/${value.project_detail?.identifier || value.project_detail?.id}/issues/${value?.sequence_id}`;
};

const removeChild = (id: string) => {
  updateIssueInfo(
    route.params.workspace as string,
    props.project_detail?.id ?? (route.params.project as string),
    id,
    {
      parent: null,
    },
  ).then(() => {
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_DELETE_SUBISSUE,
    });

    emits('refresh');
  });
};

const canDelete = (subIssue: DtoIssue): boolean => {
  return !!hasPermissionByIssue(
    subIssue,
    props.project_detail ?? project.value,
    'change-issue-primary',
  );
};
</script>

<style scoped lang="scss">
:deep(.q-item__section--side) {
  min-width: 20px !important;
  padding-right: 0;
  align-self: center;
  padding-left: 16px;
}

.issue-subtask__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 0;
}

.issue-subtask__item {
  padding: 2px 16px;
  border-radius: $radius;
  border-color: $dark-border-color !important;
}

.issue-subtask {
  padding: 20px 0;
}

.subissue-name {
  width: 80%;
  word-break: break-all;
}
</style>
