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

<script lang="ts">
import { defineComponent } from 'vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';
import PrioritySingleIcon from 'src/components/icons/PrioritySingleIcon.vue';

export default defineComponent({
  name: 'SelectPriority',
  props: {
    workspaceSlug: {
      type: String,
      required: true,
    },
    projectid: {
      type: String,
      required: true,
    },
    issueid: {
      type: String,
      required: false,
    },
    priority: {
      type: String || null,
      required: false,
    },
    issue: {
      type: Object,
      required: false,
    },
    label: {
      type: String || null,
      required: false,
      default: () => null,
    },
    newIssue: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    editIssue: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    isAdaptiveSelect: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  components: { PrioritySingleIcon },
  emits: ['refresh', 'update:priority'],
  setup(props, { emit }) {
    const api = useAiplanStore();
    const { setNotificationView } = useNotificationStore();

    const handleUpdateModelValue = (e: string) => {
      if (props.issueid) {
        api
          .issuePartialUpdate(
            props.workspaceSlug,
            props.projectid,
            props.issueid,
            { priority: e },
          )
          .then(() => {
            setNotificationView({ type: 'success', open: true });
            emit('refresh');
            emit('update:priority', e);
          });
      } else {
        emit('update:priority', e);
      }
    };

    return {
      api,
      options: ['low', 'medium', 'high', 'urgent'],
      options_label: {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий',
        urgent: 'Критический',
      },
      setNotificationView,
      handleUpdateModelValue,
    };
  },
});
</script>
