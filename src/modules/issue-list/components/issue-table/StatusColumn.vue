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
        :states-from-cache="statesCache[rowInfo.row.project]"
        @set-status="(val: any) => emits('refresh', val)"
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

defineProps<{
  rowInfo: any;
}>();

const emits = defineEmits(['refresh']);
const rolesStore = useRolesStore();
const { statesCache } = storeToRefs(useStatesStore());
</script>
