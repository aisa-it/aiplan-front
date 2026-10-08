<template>
  <div v-if="issue.state_detail" @click.stop>
    <v-menu
      v-model="isOpen"
      :close-on-content-click="false"
      @update:model-value="onToggle"
    >
      <template #activator="{ props: activatorProps }">
        <button
          v-bind="activatorProps"
          type="button"
          :disabled="!canEdit || isSaving"
          class="flex min-h-8 w-40 max-w-full items-center gap-2 border-b border-border text-left enabled:cursor-pointer enabled:hover:border-primary disabled:border-transparent"
        >
          <span
            class="size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: issue.state_detail.color }"
          />
          <span
            class="min-w-0 flex-1 truncate"
            :title="issue.state_detail.name"
            >{{ issue.state_detail.name }}</span
          >
          <v-progress-circular
            v-if="isSaving"
            indeterminate
            size="16"
            width="2"
          />
          <v-icon v-else-if="canEdit" icon="mdi-menu-down" size="18" />
        </button>
      </template>
      <v-list
        min-width="200"
        max-width="360"
        max-height="320"
        density="compact"
      >
        <div v-if="isLoading" class="flex justify-center p-3">
          <v-progress-circular indeterminate color="primary" size="24" />
        </div>
        <div v-else-if="error" class="p-4 text-center">{{ error }}</div>
        <v-list-item
          v-for="state in items"
          :key="state.id"
          :disabled="isSaving || !state.id"
          @click="selectState(state)"
        >
          <div class="flex items-center gap-2">
            <span
              class="size-3 shrink-0 rounded-full"
              :style="{ backgroundColor: state.color }"
            />
            <span class="wrap-break-word">{{ state.name }}</span>
          </div>
          <template #append>
            <v-icon
              v-if="state.id === issue.state_detail.id"
              icon="mdi-check"
              size="18"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type {
  DtoIssueWithCount,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssueStatusEditor } from '../../composables/useIssueStatusEditor';

const props = defineProps<{ issue: DtoIssueWithCount }>();
const isOpen = ref(false);
const { canEdit, isSaving, save, items, isLoading, error, load } =
  useIssueStatusEditor(() => props.issue);

const onToggle = (open: boolean) => {
  if (open) void load();
};

const selectState = async (state: DtoStateLight) => {
  if (!state.id) return;
  if (state.id === props.issue.state_detail?.id || (await save(state.id)))
    isOpen.value = false;
};
</script>
