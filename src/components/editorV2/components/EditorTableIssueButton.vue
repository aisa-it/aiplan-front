<template>
  <q-btn dense flat @click="$emit('create-issue-table')">
    <HintTooltip>Таблица задач</HintTooltip>
    <TableIssuesIcon />
  </q-btn>
</template>

<script setup lang="ts">
import TableIssuesIcon from 'src/components/icons/TableIssuesIcon.vue';

const emit = defineEmits(['create-issue-table']);
</script>
