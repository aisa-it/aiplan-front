<template>
  <div>
    <div v-if="importStatus?.finished === true && !importStatus?.error">
      <p>Проект {{ importStore.jiraProject?.name }} успешно перенесен!</p>
      <p v-if="importStatus?.end_at">
        Время импорта -
        {{
          msToRussianTime(
            dayjs(importStatus?.end_at).diff(
              dayjs(importStatus?.start_at),
              'millisecond',
            ),
          )
        }}.
      </p>
      <p
        v-show="importStatus?.done_issues || importStatus?.imported_attachments"
      >
        Импортировано
        <span v-if="importStatus?.done_issues">
          {{ numberFormat(importStatus?.done_issues) }}
          {{ getIssueEnding(importStatus?.done_issues) }}
        </span>
        <span
          v-show="
            importStatus?.done_issues && importStatus?.imported_attachments
          "
        >
          и
        </span>
        <span v-if="importStatus?.imported_attachments">
          {{ numberFormat(importStatus?.imported_attachments) }}
          {{ getAttachmentsEnding(importStatus?.imported_attachments) }}
        </span>
        <span
          v-show="
            importStatus?.done_issues || importStatus?.imported_attachments
          "
          >.
        </span>
      </p>

      <p
        v-if="importStatus?.failed_attachments?.length"
        class="primary-text cursor-pointer"
        @click="isFailedAttachmentsOpen = true"
      >
        Посмотреть ошибки переноса вложений
      </p>
      <ImportFailedAttachmentsDialog
        v-if="importStatus?.failed_attachments?.length"
        v-model="isFailedAttachmentsOpen"
        :attachments="importStatus?.failed_attachments"
      />
    </div>
    <div v-else-if="importStatus?.error">
      <p style="color: #dc3e3e">
        Ошибка при переносе проекта {{ importStore.jiraProject?.name }} ({{
          importStatus?.error
        }}).
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// core
import dayjs from 'dayjs';
import { ref, onMounted, Ref } from 'vue';
import { useRoute } from 'vue-router';
// stores
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
// utils
import { numberFormat } from 'src/utils/format';
import { msToRussianTime } from 'src/utils/time';
// components
import ImportFailedAttachmentsDialog from './import-failed-attachements-dialog/ImportFailedAttachmentsDialog.vue';
// interfaces
import { IssuesImportImportStatus } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//hooks
const route = useRoute();

// emits
const emits = defineEmits(['next']);

// store
const importStore = useImportStore();
const workspaceStore = useWorkspaceStore();

// vars
const importStatus = ref() as Ref<IssuesImportImportStatus>;
const isFailedAttachmentsOpen = ref(false);

// function
function getWordEnding(number: number, words: Array<string>) {
  const cases = [2, 0, 1, 1, 1, 2];
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  return words[n > 4 && n < 20 ? 2 : cases[Math.min(n1, 5)]];
}

function getAttachmentsEnding(number: number) {
  const words = ['вложение', 'вложения', 'вложений'];
  return getWordEnding(number, words);
}

function getIssueEnding(number: number) {
  const words = ['задача', 'задачи', 'задач'];
  return getWordEnding(number, words);
}

// lyfecycle hooks
onMounted(async () => {
  if (!importStore.importInfo?.id) return;
  await importStore
    .getImportInfo(importStore.importInfo?.id)
    .then((data) => (importStatus.value = data));

  await workspaceStore.getWorkspaceProjects(
    route.params.workspace as string,
    {},
    true,
  );
});
</script>

<style scoped>
p {
  margin-bottom: 4px;
}
</style>
