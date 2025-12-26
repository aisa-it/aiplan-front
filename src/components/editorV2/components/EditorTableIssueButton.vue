<template>
  <q-btn dense flat @click="isModalOpen = !isModalOpen">
    <HintTooltip>Таблица задач</HintTooltip>
    <TableIssuesIcon />

    <EditorTableIssueDialog v-model="isModalOpen" />
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import EditorTableIssueDialog from 'src/components/dialogs/EditorTableIssueDialog.vue';
import TableIssuesIcon from 'src/components/icons/TableIssuesIcon.vue';

const isModalOpen = ref<boolean>(false);
</script>
