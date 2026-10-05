<template>
  <!-- Каркас страницы задачи на время загрузки: повторяет раскладку IssuePanel
       (контент слева, свойства справа), чтобы страница не мигала лоадером -->
  <div class="issue-skeleton row no-wrap full-width">
    <div class="issue-skeleton__main col q-px-sm">
      <div class="flex no-wrap items-center q-py-sm">
        <q-skeleton type="text" width="55%" height="36px" />
      </div>
      <q-skeleton type="QChip" width="90px" class="q-mb-md" />

      <q-skeleton type="text" width="92%" />
      <q-skeleton type="text" width="78%" />
      <q-skeleton type="text" width="85%" />
      <q-skeleton type="rect" height="120px" class="q-my-sm" />
      <q-skeleton type="text" width="60%" />

      <q-skeleton type="text" width="140px" height="28px" class="q-mt-lg" />
      <q-skeleton type="text" width="40%" />
      <q-skeleton type="text" width="140px" height="28px" class="q-mt-md" />
      <q-skeleton type="text" width="35%" />

      <q-skeleton type="text" width="120px" height="32px" class="q-mt-lg" />
      <q-skeleton type="rect" height="36px" width="320px" class="q-mb-md" />
      <q-skeleton type="rect" height="140px" />
    </div>

    <div
      v-if="showSide"
      class="issue-skeleton__side issue-panel-card"
      :style="{ width: `${sideWidth}px` }"
    >
      <div v-for="i in 7" :key="i" class="row q-pt-md items-center">
        <div class="col">
          <q-skeleton type="text" width="70%" />
        </div>
        <div class="col">
          <q-skeleton type="rect" height="32px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Screen } from 'quasar';

// Те же пороги, что у правого drawer'а в IssuePanel.
const showSide = computed(() => Screen.width > 1323);
const sideWidth = computed(() =>
  Screen.width > 760 ? 400 : Screen.width * 0.9,
);
</script>

<style scoped lang="scss">
.issue-skeleton {
  min-height: 100%;

  &__main {
    min-width: 0;
  }

  &__side {
    flex: 0 0 auto;
  }
}
</style>
