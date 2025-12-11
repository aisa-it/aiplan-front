<template>
  <q-dialog ref="dialogRef" @before-show="onDialogShow" @hide="onDialogHide">
    <q-card class="q-dialog-plugin select-issue-dialog">
      <q-card-section class="q-pt-none">
        <h6>{{ multi ? 'Выберите задачи' : 'Выберите задачу' }}</h6>
      </q-card-section>
      <SelectIssueSearch
        v-model="params.search_query"
        @update:model-value="() => (params.offset = 0)"
      />
      <SelectIssueList
        v-model:selected-extented-issues="selectedExtentedIssues"
        v-model:selected-issues="selectedIssues"
        :loading="loading"
        :chip="chip"
        :all-allowed="allAllowed"
        :multi="multi"
        :project="props.project"
        :project-identifier="projectIdentifier"
        @remove-chip="handleRemoveChip()"
      />
      <SelectIssuePagination @update:pagination="onPagination" />

      <q-card-actions align="right">
        <q-btn no-caps class="secondary-btn" label="Отмена" v-close-popup />
        <q-btn
          no-caps
          class="primary-btn"
          label="Выбрать"
          v-close-popup
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { reactive, ref, watch } from 'vue';

// components
import SelectIssueList from './select-issue/SelectIssueList.vue';
import SelectIssueSearch from './select-issue/SelectIssueSearch.vue';
import SelectIssuePagination from './select-issue/SelectIssuePagination.vue';

// interfaces
import {
  IIssueLabel,
  IIssueSelectRequest,
  IQuasarPaginationValues,
} from 'src/interfaces/issues';
import { IProject } from 'src/interfaces/projects';

const props = withDefaults(
  defineProps<{
    allAllowed?: boolean;
    multi?: boolean | null;
    issues?: string[];
    projectIdentifier?: string | null;
    loading?: boolean;
    project?: IProject;
    chip?: any;
  }>(),
  {
    issues: () => [],
  },
);
const emits = defineEmits<{
  singleSelect: [issueId: string, parent?: IIssueLabel];
  multiSelect: [issuedIds: string[]];
  refresh: [params: IIssueSelectRequest];
}>();

const selectedIssues = ref<string[]>([]);
const selectedExtentedIssues = ref<IIssueLabel>();

const params = reactive<IIssueSelectRequest>({
  offset: 0,
  limit: 10,
  order_by: 'sequence_id',
  desc: true,
  hide_sub_issues: false,
  only_count: false,
  search_query: '',
});

const onPagination = (pagination: IQuasarPaginationValues) => {
  params.offset =
    (pagination.page - 1) *
    (pagination.rowsPerPage === 0 ? 10 : pagination.rowsPerPage);
  params.limit =
    pagination.rowsPerPage === 0
      ? pagination.rowsNumber || 10
      : pagination.rowsPerPage;
  params.order_by = pagination.sortBy || 'sequence_id';
  params.desc = pagination.descending;
  refresh();
};

const refresh = async () => {
  emits('refresh', params);
};

const onDialogShow = () => {
  selectedIssues.value = [...props.issues];
};

const onDialogHide = () => {
  selectedIssues.value = [...props.issues];
  params.search_query = '';
};

const onSave = () => {
  props.multi
    ? emits('multiSelect', selectedIssues.value)
    : emits(
        'singleSelect',
        selectedIssues.value[0] ?? null,
        selectedExtentedIssues.value,
      );
};
const handleRemoveChip = () => {
  onSave();
};

watch(
  () => params,
  () => refresh(),
  { deep: true },
);
</script>

<style scoped lang="scss">
.select-issue-dialog {
  width: 602px;
  border-radius: 16px;
  padding: 10px;
}
</style>
