<template>
  <div class="event-card" :style="`border-top: 8px solid ${event.color}`">
    <div class="event-card__header">
      <p class="identifier">
        {{ event.issueData?.identifier }}-{{ event.issueData?.sequence_id }}
      </p>
      <p v-if="!isEdit" class="title">{{ event.issueData?.title }}</p>
      <q-input
        v-else
        v-model="newName"
        class="base-input q-pa-none q-ma-none title"
        :rules="[(val) => !!val || 'Необходимо ввести название задачи']"
        autogrow
        rows="1"
        dense
        type="textarea"
      />
      <q-btn v-if="!isEdit" @click="isEdit = true" flat dense class="icon">
        <EditIcon :width="24" :height="24" />
      </q-btn>
      <q-btn v-else @click="saveNewName" flat dense class="icon">
        <CheckIcon :width="24" :height="24" />
      </q-btn>
    </div>

    <div class="event-card__row">
      <div class="row q-pt-md centered-horisontally">
        <div class="col q-mb-sm">
          <div class="row items-center">
            <CheckStatusIcon class="issue-icon" /><span class="q-ml-sm">
              Статус
            </span>
          </div>
        </div>
        <div class="col flex rounded-borders">
          <SelectStatus
            class="issue-selector full-w"
            :projectid="project.id"
            :issueid="event.issueData.id"
            :issue="event.issueData"
            :status="event.issueData.state_detail"
            :isDisabled="
              !hasPermissionByIssue(
                event.issueData,
                project,
                'change-issue-status',
              )
            "
            :states-from-cache="statesCache[project.id]"
            @set-status="(val) => (event.issueData.state_detail = val)"
            @refresh="handleRefresh"
          />
        </div>
      </div>
    </div>

    <div class="event-card__row">
      <span>Дата создания</span>
      {{ event.issueData?.created_at }}
    </div>

    <div class="event-card__row">
      <span>Срок выполнения</span>
      {{ event.issueData?.target_date }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { CalendarEvent } from '../../types/calendar';

import EditIcon from 'src/components/icons/EditIcon.vue';
import CheckIcon from 'src/components/icons/CheckIcon.vue';
import CheckStatusIcon from 'src/components/icons/CheckStatusIcon.vue';

import SelectStatus from 'src/components/SelectStatus.vue';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useStatesStore } from 'src/stores/states-store';
import { useRolesStore } from 'src/stores/roles-store';
import { storeToRefs } from 'pinia';
import { useCalendarEventStore } from '../../store/calendar-event-store';
import { useCalendarStore } from '../../store/calendar-store';
import { useCalendarFiltersStore } from '../../store/filters-store';

const calendarEventStore = useCalendarEventStore();
const calendarStore = useCalendarStore();
const calendarFilterStore = useCalendarFiltersStore();

const handleRefresh = async () => {
  await calendarEventStore.loadEvents(
    calendarStore.visibleRange,
    calendarFilterStore.enabledTypesArray,
    calendarFilterStore.filters,
  );
};

import { SUCCESS_UPDATE_DATA, BASE_ERROR } from 'src/constants/notifications';

const props = defineProps<{
  event: CalendarEvent;
}>();

const isEdit = ref(false);
const newName = ref(props.event.issueData?.title);

const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const { project } = storeToRefs(useProjectStore());
const { statesCache } = storeToRefs(useStatesStore());
const { hasPermissionByIssue } = useRolesStore();

const saveNewName = async () => {
  try {
    await singleIssueStore.updateIssueData(
      currentWorkspaceSlug.value ?? '',
      project.value.id,
      props.event.issueData?.id,
      { name: newName.value },
    );
    props.event.issueData.title = newName.value;
    isEdit.value = false;
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_UPDATE_DATA,
    });
  } catch (err) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: BASE_ERROR,
    });
  }
};

watch(
  () => props.event.issueData?.title,
  () => {
    newName.value = props.event.issueData?.title;
  },
);
</script>

<style lang="scss" scoped>
.event-card {
  border-radius: 16px;
  width: 422px;
  min-height: 215px;
  padding: 24px 16px 19px 16px;
}

.event-card__header {
  display: flex;
  align-items: flex-start;
}

.identifier {
  flex: 0 0 auto;
  white-space: nowrap;
  margin-right: 12px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.title {
  flex: 1 1 auto;
  min-width: 0;
  word-break: break-word;
  line-height: 22px;
}

.icon {
  flex: 0 0 auto;
  margin-left: 18px;
}

:deep(.q-field__native) {
  padding: 0;
}

:deep(.q-field__control),
:deep(.q-field__native) {
  padding: 0;
}

:deep(.q-textarea.q-field--dense .q-field__native) {
  padding: 0;
}

:deep(.base-input .q-field__control) {
  height: auto;
}

:deep(textarea) {
  line-height: 22px;
}
</style>
