<template>
  <SelectMembers
    v-model="watchers"
    label="Наблюдатель"
    :refresh-members-func="refreshWatchers"
    @refresh="emits('refresh')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import SelectMembers from './SelectMembers.vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useProjectStore } from 'src/stores/project-store';
import { Pagination } from './types/types';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  projectId: string;

  isAdaptiveSelect?: boolean;
  isDisabled?: boolean;
  isNotPinCurrentUser?: boolean;
  modelValue: DtoProjectMemberLight[];
}>();

const emits = defineEmits<{
  'update:modelValue': [DtoProjectMemberLight[]];
  refresh: [];
}>();

const watchers = computed({
  get() {
    return props.modelValue;
  },
  set(newWatchers) {
    emits('update:modelValue', newWatchers);
  },
});

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const projectStore = useProjectStore();

const refreshWatchers = async (
  pagination: Pagination,
  searchQuery?: string,
) => {
  return projectStore.getProjectMembers(
    currentWorkspaceSlug.value as string,
    props.projectId,
    {
      offset: pagination.offset,
      limit: pagination.limit,
      search_query: searchQuery,
      order_by: pagination.order_by,
      desc: pagination.desc,
    },
  );
};
</script>
