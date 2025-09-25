<template>
  <transition name="fade">
    <q-markup-table
      v-show="loading"
      style="position: absolute; z-index: 1000; width: 100%; box-shadow: none"
    >
      <thead>
        <tr>
          <th class="text-left" style="width: 150px">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="n in 15" :key="n">
          <td class="text-left">
            <q-skeleton animation="blink" type="text" width="85px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="50px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="35px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="65px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="25px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="85px" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </transition>
  <transition name="fade">
    <div v-show="!loading">
      <div v-for="(table, index) in issuesTables" :key="index">
        <q-item v-if="!table.issues?.length && projectProps?.showEmptyGroups">
          <GroupedHeader
            :entity="table?.entity"
            :group-by="groupBy"
            :badge-name="defineEntityName(table.entity, groupBy)"
            :badge-color="table.entity?.color ?? undefined"
            :issues-count="table?.count"
        /></q-item>

        <q-expansion-item
          v-if="table.issues?.length"
          :default-opened="
            !useProjectStore().isGroupHide(table?.entity?.id || table.entity)
          "
          @update:model-value="
            (value) =>
              useProjectStore().setGroupHide(
                entity?.entity?.id || table.entity,
                value,
              )
          "
        >
          <template #header>
            <GroupedHeader
              :entity="table?.entity"
              :group-by="groupBy"
              :badge-name="defineEntityName(table.entity, groupBy)"
              :badge-color="table.entity?.color ?? undefined"
              :issues-count="table?.count"
            />
          </template>
          <IssueTable
            :rows="table?.issues"
            :rowsCount="table?.count"
            @refresh="
              (pagination) => refreshTable(index, table.entity, pagination)
            "
          />
        </q-expansion-item>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
// core
import { EventBus } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { watch, ref, inject } from 'vue';

// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import IssueTable from './IssueTable.vue';
import GroupedHeader from './ui/GroupedHeader.vue';
import { useGroupedIssues } from '../composables/useGroupedIssues';

// utils
import { defineEntityName } from '../utils/defineEntityName';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const { getGroupedIssues } = useGroupedIssues();

const issuesStore = useIssuesStore();
const { project, projectProps, isLoadProjectInfo } =
  storeToRefs(useProjectStore());

const { workspaceInfo } = storeToRefs(useWorkspaceStore());

interface IGroupedResponse {
  entity: any;
  issues: DtoIssue[];
  count: number;
}

const issuesTables = ref<Array<IGroupedResponse>>([]);
const loading = ref(true);
const groupBy = ref('');
const route = useRoute();

const bus = inject('bus') as EventBus;

bus.on('issues-filters-update', async (group_by) => {
  if (group_by !== 'none') {
    issuesTables.value = [];
    loading.value = true;
    const response = await getGroupedIssues();
    issuesTables.value = response?.data?.issues;
    groupBy.value = response?.data?.group_by;
    loading.value = false;
  }
});

async function refreshTable(index: number, entity: any, pagination: any) {
  if (pagination?.limit !== projectProps.value?.page_size) {
    let props = JSON.parse(JSON.stringify(projectProps.value));
    props.page_size = pagination.limit;

    await useProjectStore().setProjectProps(
      route.params.workspace as string,
      route.params.project as string,
      props,
    );

    await useProjectStore().getMeInProject(
      route.params.workspace as string,
      route.params.project as string,
    );

    return await load();
  }

  const response = await issuesStore.getIssuesTable(
    workspaceInfo?.value?.id as string,
    project.value.id as string,
    {},
    pagination,
  );
  issuesTables.value[index].issues = response?.data.issues;
}

async function load() {
  issuesTables.value = [];
  loading.value = true;
  const response = await getGroupedIssues();
  issuesTables.value = response?.data?.issues;
  groupBy.value = response?.data?.group_by;
  loading.value = false;
}

watch(
  () => isLoadProjectInfo.value,
  async () => {
    if (isLoadProjectInfo.value === false) {
      await load();
    }
  },
);
</script>
