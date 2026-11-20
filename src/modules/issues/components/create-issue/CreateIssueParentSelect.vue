<template>
  <v-autocomplete
    v-model:menu="menu"
    v-model:search="search"
    :model-value="model"
    :items="items"
    :loading="isLoading"
    :disabled="disabled"
    :label="t('issues.create.chooseParent')"
    :no-data-text="t('issues.create.noParents')"
    :item-title="formatParentTitle"
    item-value="id"
    clearable
    hide-selected
    no-filter
    density="compact"
    variant="underlined"
    hide-details
    @update:model-value="selectParent"
  >
    <template #selection="{ internalItem }">
      <span class="truncate" :title="internalItem.title">{{ internalItem.title }}</span>
    </template>
    <template #menu-footer>
      <v-btn
        v-if="hasMore"
        :loading="isLoading"
        type="button"
        block
        variant="text"
        color="primary"
        @mousedown.prevent
        @click="loadMore"
      >
        {{ t('issues.create.loadMore') }}
      </v-btn>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { searchIssueParents } from '../../api/create-issue-options.source';
import { useCreateIssueOptionSearch } from '../../composables/useCreateIssueOptionSearch';

const props = defineProps<{
  workspaceSlug: string;
  projectId: string;
  projectIdentifier?: string;
  onlyAuthoredBy?: string;
  disabled?: boolean;
}>();

const model = defineModel<string | null>({ required: true });
const { t } = useI18n();
const selected = shallowRef<DtoIssueWithCount>();

const formatParentTitle = (issue: DtoIssueWithCount | string) => {
  if (typeof issue === 'string') return issue;

  const identifier = issue.project_detail?.identifier ?? props.projectIdentifier;
  const number =
    identifier && issue.sequence_id != null
      ? `${identifier}-${issue.sequence_id}`
      : '';
  return [number, issue.name].filter(Boolean).join(' · ');
};

const load = computed(() => {
  const { workspaceSlug, projectId, onlyAuthoredBy } = props;

  return async (
    query: string,
    offset: number,
    signal: AbortSignal,
  ) => {
    const { issues, nextOffset } = await searchIssueParents(
      workspaceSlug,
      projectId,
      query,
      onlyAuthoredBy,
      offset,
      signal,
    );
    return { items: issues, nextOffset };
  };
});

const {
  menu,
  search,
  items: matches,
  isLoading,
  hasMore,
  loadMore,
} = useCreateIssueOptionSearch(load);
const items = computed(() => {
  const parent = selected.value;
  if (
    !parent ||
    parent.id !== model.value ||
    matches.value.some(({ id }) => id === parent.id)
  ) {
    return matches.value;
  }
  return [parent, ...matches.value];
});

watch(
  () => [props.workspaceSlug, props.projectId],
  () => {
    selected.value = undefined;
    menu.value = false;
    search.value = '';
  },
);

const selectParent = (id: string | null) => {
  selected.value = items.value.find((parent) => parent.id === id);
  model.value = id;
};
</script>
