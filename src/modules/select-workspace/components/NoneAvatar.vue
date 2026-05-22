<template>
  <div class="none-avatar text-avatar">
    {{ getFirstSymbol(workspaceName) }}
  </div>
</template>

<script setup lang="ts">
import { getFirstSymbol } from 'src/utils/helpers';

const props = defineProps<{
  workspaceName: string | undefined;
}>();
</script>
