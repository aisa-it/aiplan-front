<template>
  <div class="h-full min-h-0 overflow-y-auto px-4 pb-4">
    <div v-if="isLoading" role="status" aria-busy="true">
      <span class="sr-only">{{ t('issues.analytics.loading') }}</span>
      <div v-for="row in 3" :key="row" class="mt-4">
        <v-skeleton-loader type="text" width="180" />
        <div class="analytics-grid mt-2">
          <v-skeleton-loader
            v-for="card in 4"
            :key="card"
            type="text"
            height="48"
          />
        </div>
      </div>
    </div>

    <v-alert v-else-if="hasError" type="error" variant="tonal" class="mt-4">
      {{ t('issues.analytics.loadError') }}
    </v-alert>

    <template v-else>
      <section v-for="section in sections" :key="section.id" class="mt-4">
        <h2 class="mb-2 text-base font-medium">
          {{ t(`issues.analytics.sections.${section.id}`) }}
        </h2>
        <div class="analytics-grid">
          <v-card
            v-for="card in section.cards"
            :key="card.id"
            tag="article"
            variant="flat"
            rounded="xl"
            class="analytics-card flex min-h-12 flex-col justify-center gap-2 px-3 py-2.5 text-sm"
          >
            <p v-if="card.title" class="break-words font-semibold">
              {{ card.title }}
            </p>
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <div v-for="metric in card.metrics" :key="metric.label">
                <span class="mr-1 font-semibold">{{ metric.count }}</span>
                <span class="break-words">{{ metric.label }}</span>
              </div>
            </div>
          </v-card>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoProjectStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { ProjectService } from '@/services/project.service';
import type { ProjectIssueListScope } from '../../model/issue-list.types';
import { buildProjectAnalytics } from '../../model/project-analytics';

const props = defineProps<{ scope: ProjectIssueListScope }>();
const { t, locale } = useI18n();

const isLoading = ref(true);
const hasError = ref(false);
const stats = shallowRef<DtoProjectStats>();
const sections = computed(() =>
  stats.value ? buildProjectAnalytics(stats.value, t, locale.value) : [],
);

const controller = new AbortController();
onMounted(async () => {
  const { workspaceSlug, projectId } = props.scope;
  const { signal } = controller;

  try {
    const result = await ProjectService.getProjectStats(workspaceSlug, projectId, signal);
    if (!signal.aborted) stats.value = result;
  } catch {
    if (!signal.aborted) hasError.value = true;
  } finally {
    if (!signal.aborted) isLoading.value = false;
  }
});
onBeforeUnmount(() => controller.abort());
</script>

<style scoped>
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  gap: 8px;
}

.analytics-card {
  border: 1px solid rgb(var(--v-theme-border));
}
</style>
