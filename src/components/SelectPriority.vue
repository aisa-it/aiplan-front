<template>
  <q-select
    options-dense
    :clearable="priority !== 'Нет'"
    dense
    :label="label ? label : undefined"
    :class="`${label ? 'base-selector' : 'base-selector-sm'} ${isAdaptiveSelect ? 'adaptive-select' : ''}`"
    popup-content-class="scrollable-content"
    :modelValue="priority"
    :disable="isDisabled"
    :options="options"
    :option-label="(v) => options_label[v] || 'Не Выбран'"
    :style="{ width: isAdaptiveSelect ? '' : '160px' }"
    @update:modelValue="handleUpdateModelValue"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-italic text-grey">
          Нет приоритетов
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" class="q-pa-xs">
        <q-item-section class="q-pa-xs" avatar :style="'min-width: 24px'">
          <PrioritySingleIcon :type="scope.opt" />
        </q-item-section>
        <q-item-section class="q-pa-xs">
          <q-item-label>
            {{ options_label[scope.opt] || 'Не Выбран' }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="{ opt }">
      <PrioritySingleIcon :type="opt" />
      <q-item-label class="q-ml-xs">
        {{
          opt === 'urgent' && editIssue
            ? 'Критич.'
            : options_label[opt] || 'Не Выбран'
        }}
      </q-item-label>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';
import PrioritySingleIcon from 'src/components/icons/PrioritySingleIcon.vue';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  workspaceSlug: string;
  projectid: string;
  issueid: string;
  priority?: string;
  issue?: DtoIssue;
  label?: string;
  newIssue?: boolean;
  editIssue?: boolean;
  isDisabled?: boolean;
  isAdaptiveSelect?: boolean;
}>();

const emits = defineEmits<{
  refresh: [];
  'update:priority': [string];
}>();

const api = useAiplanStore();
const { setNotificationView } = useNotificationStore();

const handleUpdateModelValue = (e: string) => {
  if (props.issueid) {
    api
      .issuePartialUpdate(props.workspaceSlug, props.projectid, props.issueid, {
        priority: e,
      })
      .then(() => {
        setNotificationView({ type: 'success', open: true });
        emits('refresh');
        emits('update:priority', e);
      });
  } else {
    emits('update:priority', e);
  }
};

const options = ['low', 'medium', 'high', 'urgent'];
const options_label = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Критический',
};
</script>
