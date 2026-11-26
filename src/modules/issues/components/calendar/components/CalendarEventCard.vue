<template>
  <div class="calendar-event-card" :style="{ borderTopColor: EVENT_TYPES[eventType].color }">
    <div class="mb-4 flex min-w-0 items-start gap-3">
      <strong class="shrink-0 text-base">{{ issue.project_detail?.identifier }}-{{ issue.sequence_id }}</strong>
      <span v-if="!editing" class="min-w-0 flex-1 wrap-anywhere">{{ issue.name }}</span>
      <v-textarea
        v-else
        v-model="name"
        :aria-label="t('issues.columns.name')"
        :error-messages="nameError"
        :disabled="saving"
        auto-grow
        autofocus
        rows="1"
        density="compact"
        variant="underlined"
        class="min-w-0 flex-1"
        @keydown.enter.prevent="saveName"
        @keydown.esc.stop="editing = false"
      />
      <v-btn
        v-if="canEdit"
        :icon="editing ? 'mdi-check' : 'mdi-pencil-outline'"
        :aria-label="editing ? t('common.actions.save') : t('issues.calendar.editName')"
        :loading="saving"
        variant="text"
        density="comfortable"
        size="32"
        @click="editing ? saveName() : startEditing()"
      />
    </div>
    <div class="calendar-event-details">
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-check-circle-outline" size="20" />
        {{ t('issues.columns.state') }}
      </div>
      <StatusColumn v-model:open="statusOpen" :issue="issue" />

      <template v-for="type in eventTypes" :key="type">
        <div class="flex items-center gap-2">
          <v-icon :icon="dateIcons[type]" size="20" />
          <span>{{ t(`issues.calendar.${type}`) }}</span>
        </div>
        <span>{{ displayDate(type) }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { formatDateTime } from '@/utils/time';
import { useIssueFieldEditor } from '../../../composables/useIssueFieldEditor';
import StatusColumn from '../../issue-table/StatusColumn.vue';
import { EVENT_TYPES, eventTypes, type EventType } from '../utils/calendar-events';

const props = defineProps<{ issue: DtoIssueWithCount; eventType: EventType }>();
const locked = defineModel<boolean>('locked', { required: true });
const { t } = useI18n();
const editing = ref(false);
const statusOpen = ref(false);
const name = ref('');
const nameError = ref('');
const { canEdit, isSaving: saving, save } = useIssueFieldEditor(() => props.issue, 'name');
const dateIcons = {
  created: 'mdi-calendar-today-outline',
  target: 'mdi-calendar-end-outline',
  completed: 'mdi-calendar-check-outline',
};

watch([editing, statusOpen, saving], ([isEditing, choosingStatus, isSaving]) => {
  locked.value = isEditing || choosingStatus || isSaving;
}, { flush: 'sync' });

function displayDate(type: EventType) {
  const date = props.issue[EVENT_TYPES[type].field];
  return date ? formatDateTime(date) : '–';
}

function startEditing() {
  name.value = props.issue.name ?? '';
  nameError.value = '';
  editing.value = true;
}

async function saveName() {
  const value = name.value.trim();
  if (!value) {
    nameError.value = t('issues.calendar.nameRequired');
    return;
  }
  if (value === props.issue.name || await save(value)) {
    editing.value = false;
  } else {
    nameError.value = t('issues.calendar.nameError');
  }
}
</script>

<style scoped>
.calendar-event-card {
  width: min(422px, calc(100vw - 24px));
  min-height: 215px;
  padding: 24px 16px 19px;
  border-radius: 16px;
  border: 1px solid rgb(var(--v-theme-border));
  border-top: 8px solid;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
  font-size: 14px;
}
.calendar-event-details {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}
</style>
