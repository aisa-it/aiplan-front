<template>
  <div class="flex justify-center">
    <QuantityChip :column="column" :count="count" />
  </div>
</template>

<script setup lang="ts">
import QuantityChip from '../QuantityChip.vue';
import type { IssueCountColumnKey } from '../../constants/issue-table-columns';

defineProps<{ column: IssueCountColumnKey; count?: number }>();
</script>
