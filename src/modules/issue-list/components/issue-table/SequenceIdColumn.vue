<template>
  <q-td
    :props="rowInfo"
    :style="`font-size: 12px; padding: 7px 4px; cursor: pointer;`"
    @click.stop="
      () =>
        singleIssueStore.openIssue(
          rowInfo.row.sequence_id,
          user.theme?.open_in_new ? '_blank' : '_self',
          rowInfo.row.project,
        )
    "
  >
    {{ rowInfo?.value[0] }}-{{ rowInfo?.value[1] }}
  </q-td>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';

// stores
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';

defineProps<{
  rowInfo: any;
}>();

const singleIssueStore = useSingleIssueStore();
const { user } = storeToRefs(useUserStore());
</script>
