<template>
  <q-td :props="rowInfo">
    <div @click.stop>
      <SelectStatus
        :projectid="rowInfo.row.project"
        :issueid="rowInfo.row.id"
        :status="rowInfo.row.state_detail"
        :issue="rowInfo.row"
        :isDisabled="
          !rolesStore.hasPermissionByIssue(rowInfo.row, 'change-issue-status')
        "
        :states-from-cache="getStatesFromCacheByProject(rowInfo.row.project)"
        @set-status="(val: any) => emits('refresh', val)"
        @update:states-from-cache="updateStatesFromCache"
      />
    </div>
  </q-td>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useStatesStore } from 'src/stores/states-store';

// components
import SelectStatus from 'src/components/SelectStatus.vue';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IState } from 'src/interfaces/states';

defineProps<{
  rowInfo: { row: DtoIssue };
}>();

const emits = defineEmits<{ refresh: [any] }>();
const rolesStore = useRolesStore();
const { statesCache } = storeToRefs(useStatesStore());

const getStatesFromCacheByProject = (projectId: string): IState[] => {
  if (!statesCache.value || !projectId) {
    return [];
  }

  const filteredStates: IState[] = [];

  for (const groupName in statesCache.value) {
    const list = statesCache.value[groupName];
    if (!Array.isArray(list)) continue;

    const projectStates = list.filter(
      (state) => state?.project === projectId,
    );

    for (const state of projectStates) {
      filteredStates.push(state);
    }
  }

  return !filteredStates.length ? undefined : filteredStates;
};

const updateStatesFromCache = (data: IState[]) => {
  statesCache.value = data;
};
</script>
