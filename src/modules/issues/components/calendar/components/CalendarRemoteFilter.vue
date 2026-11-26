<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="search"
    :items="options"
    :label="label"
    :loading="loading"
    :no-data-text="failed ? t('issues.calendar.optionsError') : undefined"
    :menu-props="{ maxHeight: 320 }"
    item-title="name"
    item-value="id"
    variant="underlined"
    density="compact"
    hide-details
    multiple
    clearable
    no-filter
  >
    <template v-if="$slots.prepend" #prepend-item>
      <slot name="prepend" />
    </template>
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template v-if="item.color" #prepend>
          <span class="mr-3 size-3 rounded-full" :style="{ backgroundColor: item.color }" />
        </template>
      </v-list-item>
    </template>
    <template #selection="{ index }">
      <span v-if="index === 0" class="calendar-filter-selection">{{ summary }}</span>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

type Option = { id: string; name: string; color?: string };

const props = defineProps<{
  label: string;
  load: (search: string, signal: AbortSignal) => Promise<Option[]>;
}>();
const selected = defineModel<string[]>({ required: true });
const { t } = useI18n();
const search = ref('');
const debouncedSearch = refDebounced(search, 300);
const loading = ref(false);
const failed = ref(false);
const results = shallowRef<Option[]>([]);
const known = new Map<string, Option>();

const options = computed(() => {
  const items = new Map(results.value.map((item) => [item.id, item]));
  for (const id of selected.value ?? []) {
    const item = known.get(id);
    if (item) items.set(id, item);
  }
  return [...items.values()];
});
const summary = computed(() => (selected.value ?? [])
  .map((id) => options.value.find((item) => item.id === id)?.name ?? id)
  .join(', '));

watch(debouncedSearch, async (value, _, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  loading.value = true;
  failed.value = false;
  try {
    const items = await props.load(value.trim(), controller.signal);
    if (controller.signal.aborted) return;
    for (const item of items) known.set(item.id, item);
    results.value = items;
  } catch {
    if (!controller.signal.aborted) {
      failed.value = true;
      results.value = [];
    }
  } finally {
    if (!controller.signal.aborted) loading.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
.calendar-filter-selection {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
