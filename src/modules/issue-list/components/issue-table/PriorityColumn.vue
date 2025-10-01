<template>
  <q-td :props="rowInfo" style="min-width: 200px">
    <SelectPriority
      :workspace-slug="rowInfo.row.workspace_detail.slug"
      :projectid="rowInfo.row.project"
      :issueid="rowInfo.row.id"
      :priority="rowInfo.value"
      :issue="rowInfo.row"
      :is-disabled="
        !rolesStore.hasPermissionByIssue(
          rowInfo.row,
          project,
          'change-issue-primary',
        )
      "
      @refresh="emits('refresh')"
    ></SelectPriority>
  </q-td>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
// components
import SelectPriority from 'src/components/SelectPriority.vue';

defineProps<{
  rowInfo: any;
}>();

const emits = defineEmits(['refresh']);
const rolesStore = useRolesStore();
const { project } = storeToRefs(useProjectStore());
</script>
