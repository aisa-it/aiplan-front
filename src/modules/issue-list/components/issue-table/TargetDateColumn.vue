<template>
  <q-td :props="rowInfo">
    <div @click.stop>
      <SelectDate
        :workspace-id="rowInfo.row.workspace_detail.slug"
        :project-id="rowInfo.row.project"
        :issue-id="rowInfo.row.id"
        :date="rowInfo.row.target_date"
        :issue="rowInfo.row"
        :is-disabled="
          !rolesStore.hasPermissionByIssue(rowInfo.row, 'change-issue-primary') || isDisabled
        "
        @refresh="emits('refresh')"
      ></SelectDate>
    </div>
  </q-td>
</template>

<script setup lang="ts">
// stores
import { useRolesStore } from 'src/stores/roles-store';
// components
import SelectDate from 'src/components/SelectDate.vue';

defineProps<{
  rowInfo: any;
  isDisabled?: boolean;
}>();

const emits = defineEmits(['refresh']);
const rolesStore = useRolesStore();
</script>
