<template>
  <q-td :props="rowInfo" style="min-width: 200px; max-width: 200px">
    <div @click.stop>
      <SelectSprints
        :workspace-slug="rowInfo.row.workspace_detail?.slug"
        :issueid="rowInfo.row.id"
        :currentSprints="rowInfo.row.sprints ?? []"
        :is-disabled="
          !rolesStore.hasPermissionByIssue(
            rowInfo.row,
            rowInfo.row.project_detail ?? project,
            'change-issue-primary'
          )
        "
        @refresh="emits('refresh')"
      />
    </div>
  </q-td>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import SelectSprints from 'src/components/SelectSprints.vue';

defineProps<{
  rowInfo: any;
}>();

const emits = defineEmits(['refresh']);

const rolesStore = useRolesStore();
const { project } = storeToRefs(useProjectStore());
</script>
