<template>
  <FiltersList
    :columns="columns"
    :view-form="viewForm"
    :options-group="optionsGroup"
    :is-show-indicators="isShowIndicators"
    :views-options="PROJECT_VIEWS"
    :toggles="toggles"
    :filters-toggles="filtersToggles"
    :on-update="onUpdate"
    :update-issue-view="updateIssueView"
    :refresh-filters="refreshFilters"
    :statuses="getStatusesAsArray"
  />
</template>

<script setup lang="ts">
import FiltersList from 'src/components/FiltersList.vue';
import { useProjectFilters } from '../composables/useProjectFilters';
import { PROJECT_VIEWS } from 'src/constants/constants';

defineProps<{
  columns: any[];
}>();

const emit = defineEmits(['update']);

const {
  viewForm,
  optionsGroup,
  isShowIndicators,
  toggles,
  filtersToggles,
  getStatusesAsArray,
  onUpdate,
  refreshFilters,
  updateIssueView,
} = useProjectFilters(emit);
</script>
