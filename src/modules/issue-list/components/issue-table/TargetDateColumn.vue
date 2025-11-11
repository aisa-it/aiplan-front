<template>
  <q-td :props="rowInfo">
    <div @click.stop>
      <SelectDate
        :workspace-id="rowInfo.row.workspace_detail.slug"
        :projectid="rowInfo.row.project"
        :issueid="rowInfo.row.id"
        :date="rowInfo.row.target_date"
        :issue="rowInfo.row"
        :is-disabled="
          !rolesStore.hasPermissionByIssue(
            rowInfo.row,
            project,
            'change-issue-primary',
          )
        "
        @refresh="emits('refresh')"
      ></SelectDate>
    </div>
  </q-td>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
// components
import SelectDate from 'src/components/SelectDate.vue';

defineProps<{
  rowInfo: any;
}>();

const emits = defineEmits(['refresh']);
const rolesStore = useRolesStore();
const { project } = storeToRefs(useProjectStore());
</script>
