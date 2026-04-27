<template>
  <q-td :props="rowInfo" style="min-width: 200px">
    <div @click.stop>
      <SelectPriority
        :workspace-slug="rowInfo.row.workspace_detail.slug"
        :projectid="rowInfo.row.project"
        :issueid="rowInfo.row.id"
        :priority="rowInfo.value"
        :issue="rowInfo.row"
        :is-disabled="
          !rolesStore.hasPermissionByIssue(rowInfo.row, 'change-issue-primary')
        "
        @refresh="emits('refresh')"
      ></SelectPriority>
    </div>
  </q-td>
</template>

<script setup lang="ts">
// stores
import { useRolesStore } from 'src/stores/roles-store';
// components
import SelectPriority from 'src/components/SelectPriority.vue';

defineProps<{
  rowInfo: any;
}>();

const emits = defineEmits(['refresh']);
const rolesStore = useRolesStore();
</script>
