<template>
  <q-btn dense flat @click="isModalOpen = !isModalOpen">
    <HintTooltip>Таблица задач</HintTooltip>
    <TableIssuesIcon />

    <EditorTableIssueDialog v-model="isModalOpen" :editor-instance="editorInstance"/>
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Editor } from '@tiptap/core';

import EditorTableIssueDialog from 'src/components/dialogs/EditorTableIssueDialog.vue';
import TableIssuesIcon from 'src/components/icons/TableIssuesIcon.vue';

const props = defineProps<{
  editorInstance: Editor;
}>()

const isModalOpen = ref<boolean>(false);
</script>
