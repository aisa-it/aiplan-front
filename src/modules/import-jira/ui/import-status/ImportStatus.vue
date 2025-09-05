<template>
  <div>
    <div class="row">
      <h6>Статус импорта</h6>
    </div>
    <p v-if="jiraProject?.name">Проект: {{ jiraProject?.name }}</p>
    <p>
      Текущая стадия:
      <span v-if="importStatus?.stage">
        {{ defineStage(importStatus?.stage) }}
      </span>
    </p>
    <p v-if="importStatus?.done_issues">
      Перенесено задач: {{ numberFormat(importStatus?.done_issues) }} из
      <span v-if="importStatus?.total_issues">{{
        numberFormat(importStatus?.total_issues)
      }}</span>
    </p>
    <p v-if="importStatus?.imported_attachments">
      Перенесено вложений:
      {{ numberFormat(importStatus?.imported_attachments) }} из
      <span v-if="importStatus?.total_attachments">{{
        numberFormat(importStatus?.total_attachments)
      }}</span>
    </p>
    <q-linear-progress
      v-if="progressImport >= 0"
      :value="progressImportBar"
      size="32px"
      style="flex: 1; margin-bottom: 12px"
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          color="white"
          text-color="accent"
          :label="`Выполнено ${progressImport}%`"
        />
      </div>
    </q-linear-progress>
    <p>Общий прогресс</p>
    <q-linear-progress
      v-if="progressGlobal >= 0"
      :value="progressGlobalBar"
      size="32px"
      style="flex: 1"
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          color="white"
          text-color="accent"
          :label="`Выполнено ${progressGlobal}%`"
        />
      </div>
    </q-linear-progress>
    <div class="row justify-end q-mt-md">
      <q-btn
        class="delete-btn"
        no-caps
        style="height: 24px"
        @click="handleCancelImport"
      >
        Отменить
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
// core
import { ref, onMounted, onUnmounted, computed, Ref } from 'vue';
import { storeToRefs } from 'pinia';
// stores
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
// utils
import { numberFormat } from 'src/utils/format';
// constants
import { defineStage } from 'src/constants/jiraConstants';
// interfaces

import { IssuesImportImportStatus } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// emits
const emits = defineEmits(['next', 'get-back']);

// store
const importStore = useImportStore();

const { jiraProject } = storeToRefs(importStore);
// vars
const importStatus = ref() as Ref<IssuesImportImportStatus>;
const refreshInterval = ref();

// computed
const progressImportBar = computed(() => {
  return importStatus.value?.progress ? importStatus.value.progress * 0.01 : 0;
});

const progressGlobalBar = computed(() => {
  return importStatus.value?.global_progress
    ? importStatus.value?.global_progress * 0.01
    : 0;
});
const progressImport = computed(() => {
  return importStatus.value?.progress
    ? Math.round(importStatus.value.progress)
    : 0;
});
const progressGlobal = computed(() => {
  return importStatus.value?.global_progress
    ? Math.round(importStatus.value.global_progress)
    : 0;
});

//methods
const intervalRefresh = () => {
  clearInterval(refreshInterval.value);

  refreshInterval.value = setInterval(() => {
    if (!importStore.importInfo?.id) return;
    importStore
      .getImportInfo(importStore.importInfo?.id)
      .then((data) => {
        importStatus.value = data as IssuesImportImportStatus;

        if (importStatus.value.finished) {
          emits('next');
          return clearInterval(refreshInterval.value);
        }
      })
      .catch((err) => console.log(err));
  }, 1000);
};

const handleCancelImport = () => {
  return importStore.stopImport(importStore.importInfo?.id as string);
};

//lyfecycle hooks
onMounted(() => intervalRefresh());

onUnmounted(() => clearInterval(refreshInterval.value));
</script>

<style scoped lang="scss">
.jira-project-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
