<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    location="bottom end"
    content-class="issue-filters-menu"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="text"
        density="compact"
        icon
        size="32"
        class="issue-filters-activator"
        :aria-label="t('issues.filters.display')"
      >
        <DotListSelectIcon v-if="hasIndicators" :width="20" :height="20" />
        <DotListIcon v-else :width="20" :height="20" />
      </v-btn>
    </template>

    <div class="issue-filters-panel">
      <div class="issue-filters-heading">
        <span>{{ t('issues.filters.display') }}</span>
        <v-btn
          variant="text"
          density="compact"
          icon
          class="issue-filters-reset"
          :aria-label="t('issues.filters.reset')"
          @click="resetDialog = true"
        >
          <span class="mdi mdi-refresh" aria-hidden="true" />
          <v-tooltip activator="parent" location="bottom">{{
            t('issues.filters.reset')
          }}</v-tooltip>
        </v-btn>
      </div>

      <div class="issue-filters-field">
        <v-select
          :label="t('issues.filters.view')"
          :model-value="selectedView"
          :items="viewOptions"
          density="compact"
          variant="underlined"
          hide-details
          @update:model-value="setView"
        />
      </div>
      <div class="issue-filters-field">
        <IssueColumnPicker
          :options="columnOptions"
          :selected="selectedColumns"
          @change="setColumns"
        />
      </div>
      <div class="issue-filters-field">
        <v-select
          :label="t('issues.filters.grouping')"
          :model-value="selectedGroup"
          :items="groupOptions"
          density="compact"
          variant="underlined"
          hide-details
          @update:model-value="setGroup"
        />
      </div>
      <div class="issue-filters-field">
        <v-select
          :label="t('issues.filters.statusFilter')"
          :model-value="selectedStates"
          :items="statuses"
          :loading="optionsLoading"
          :disabled="optionsLoading"
          item-title="name"
          item-value="id"
          multiple
          clearable
          density="compact"
          variant="underlined"
          hide-details
          @update:model-value="setStates"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <span
                  class="issue-status-dot"
                  :style="{ backgroundColor: item.color }"
                />
              </template>
            </v-list-item>
          </template>
        </v-select>
      </div>

      <div
        v-for="toggle in displayToggles"
        :key="toggle.key"
        class="issue-filters-toggle"
      >
        <span>{{ toggle.label }}</span>
        <v-switch
          :model-value="isDisplayToggleEnabled(toggle.key)"
          color="primary"
          density="compact"
          hide-details
          @update:model-value="emit('change', { [toggle.key]: Boolean($event) })"
        />
      </div>
      <div
        v-for="toggle in personalToggles"
        :key="toggle.key"
        class="issue-filters-toggle"
      >
        <span>{{ toggle.label }}</span>
        <v-switch
          :model-value="Boolean(settings?.filters?.[toggle.key])"
          color="primary"
          density="compact"
          hide-details
          @update:model-value="
            emit('change', { filters: { [toggle.key]: Boolean($event) } })
          "
        />
      </div>
    </div>
  </v-menu>

  <v-dialog v-model="resetDialog" width="560" max-width="calc(100vw - 32px)">
    <v-card rounded="md">
      <v-card-text class="issue-filters-reset-message">
        {{ t('issues.filters.resetQuestion') }}
      </v-card-text>
      <v-card-actions class="issue-filters-reset-actions justify-end gap-3">
        <v-btn
          variant="outlined"
          color="primary"
          width="110"
          height="40"
          class="issue-filters-reset-action"
          @click="resetDialog = false"
        >
          {{ t('issues.filters.cancel') }}
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          width="110"
          height="40"
          class="issue-filters-reset-action"
          @click="confirmReset"
        >
          {{ t('issues.filters.execute') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoStateLight, TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import DotListIcon from '@/components/icons/DotListIcon.vue';
import DotListSelectIcon from '@/components/icons/DotListSelectIcon.vue';
import type { IssueColumnKey } from '../model/issue-list.types';
import { normalizeIssueGroupBy } from '../model/issue-groups';
import type {
  IssueDisplayToggleKey,
  IssueFilterColumnOption,
  IssueFilterOption,
  IssueFilterToggle,
  IssuePersonalToggleKey,
  IssueViewOption,
} from '../model/issue-filters.types';
import IssueColumnPicker from './IssueColumnPicker.vue';
import '../styles/issue-filters.css';

const props = defineProps<{
  settings?: TypesViewProps;
  defaults: TypesViewProps;
  statuses: (DtoStateLight & { ids?: string[] })[];
  optionsLoading: boolean;
  columnOptions: IssueFilterColumnOption[];
  viewOptions: IssueViewOption[];
  groupOptions: IssueFilterOption[];
  displayToggles: IssueFilterToggle<IssueDisplayToggleKey>[];
  personalToggles: IssueFilterToggle<IssuePersonalToggleKey>[];
}>();
const emit = defineEmits<{
  change: [patch: TypesViewProps];
  reset: [];
}>();
const { t } = useI18n();
const open = ref(false);
const resetDialog = ref(false);

const selectedView = computed(() =>
  props.viewOptions.find((option) => option.value === props.settings?.issueView)?.value ??
  props.viewOptions[0]?.value,
);
const selectedGroup = computed(() =>
  props.groupOptions.find((option) => option.value === normalizeIssueGroupBy(props.settings?.filters?.group_by))?.value ??
  props.groupOptions[0]?.value,
);
const selectedColumns = computed<IssueColumnKey[]>(() =>
  (props.settings?.columns_to_show ?? props.defaults.columns_to_show ?? []).filter(
    (key): key is IssueColumnKey =>
      props.columnOptions.some((option) => option.key === key) ||
      key.startsWith('property:'),
  ),
);
const selectedStates = computed(() => {
  const states = props.settings?.filters?.states ?? [];
  const groups = props.statuses.filter((option) => option.ids?.length);
  if (!groups.length) return states;
  const matched = new Set(groups.flatMap((option) => option.ids ?? []));
  const selected = new Set(states);
  return [
    ...groups.flatMap((option) =>
      option.id && option.ids?.some((id) => selected.has(id)) ? [option.id] : [],
    ),
    ...states.filter((id) => !matched.has(id)),
  ];
});
const hasIndicators = computed(() =>
  Boolean(
    props.settings?.hideSubIssues ||
      props.settings?.showOnlyActive ||
      props.settings?.filters?.states?.length ||
      (selectedGroup.value && selectedGroup.value !== 'none') ||
      props.columnOptions.some(
        (option) => option.key !== 'project' && !selectedColumns.value.includes(option.key),
      ),
  ),
);

const isDisplayToggleEnabled = (key: IssueDisplayToggleKey) =>
  Boolean(props.settings?.[key] ?? props.defaults[key]);
const setView = (value: string) => {
  if (props.viewOptions.length <= 1) return;
  const option = props.viewOptions.find((item) => item.value === value);
  if (option && option.value !== props.settings?.issueView) {
    const group = normalizeIssueGroupBy(props.settings?.filters?.group_by);
    const groupOption = props.groupOptions.find((item) => item.value === group);
    const defaultGroup = props.groupOptions.find((item) => item.value !== 'none');
    emit('change', {
      issueView: option.value,
      ...(option.value === 'kanban' && !groupOption && defaultGroup
        ? { filters: { group_by: defaultGroup.value } }
        : {}),
    });
  }
};
const setGroup = (value: string) => {
  if (props.groupOptions.length <= 1) return;
  if (
    props.groupOptions.some((item) => item.value === value) &&
    value !== props.settings?.filters?.group_by
  ) {
    emit('change', { filters: { group_by: value } });
  }
};
const setColumns = (columns: IssueColumnKey[]) => {
  emit('change', { columns_to_show: columns });
};
const setStates = (states: string[] | null) => {
  const idsByValue = new Map(props.statuses.map((option) => [option.id, option.ids]));
  const ids = (states ?? []).flatMap((value) => idsByValue.get(value) ?? [value]);
  emit('change', { filters: { states: [...new Set(ids)] } });
};
const confirmReset = () => {
  resetDialog.value = false;
  emit('reset');
};
</script>
