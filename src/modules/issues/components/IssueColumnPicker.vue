<template>
  <v-select
    v-model:menu="open"
    :label="t('issues.filters.columns')"
    :model-value="selected"
    :items="selectItems"
    class="issue-column-picker"
    :menu-props="{ contentClass: 'issue-columns-menu', maxHeight: 620 }"
    multiple
    density="compact"
    variant="underlined"
    hide-details
  >
    <template #selection="{ index }">
      <span v-if="index === 0" class="issue-columns-selection">{{ selectedLabels }}</span>
    </template>
    <template #prepend-item>
      <div ref="listRoot" class="issue-columns-list">
        <div
          v-for="option in orderedOptions"
          :key="option.key"
          :data-column="option.key"
          class="issue-columns-option"
          role="option"
          :aria-selected="selected.includes(option.key)"
          tabindex="0"
          @click="toggle(option.key, !selected.includes(option.key))"
          @keydown.enter.prevent="toggle(option.key, !selected.includes(option.key))"
          @keydown.space.prevent="toggle(option.key, !selected.includes(option.key))"
        >
          <span class="issue-columns-check">
            <v-checkbox-btn
              :model-value="selected.includes(option.key)"
              density="compact"
              :ripple="false"
              tabindex="-1"
              @click.stop
              @update:model-value="toggle(option.key, Boolean($event))"
            />
          </span>
          <span
            class="min-w-0 truncate"
            :title="option.key.startsWith('property:') ? option.title : undefined"
          >{{ option.title }}</span>
          <v-icon icon="mdi-drag" size="20" class="issue-columns-drag" @click.stop />
        </div>
      </div>
    </template>
    <template #no-data>
      <span class="hidden" />
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Sortable from 'sortablejs';
import type { IssueColumnKey } from '../model/issue-list.types';
import '../styles/issue-filters.css';

interface ColumnOption { key: IssueColumnKey; title: string }
const props = defineProps<{
  options: ColumnOption[];
  selected: IssueColumnKey[];
}>();
const emit = defineEmits<{ change: [IssueColumnKey[]] }>();
const { t } = useI18n();
const selectItems: IssueColumnKey[] = [];
const open = ref(false);
const listRoot = ref<HTMLElement | null>(null);
let sortable: Sortable | undefined;
let orderBeforeDrag: IssueColumnKey[] = [];

const orderedOptions = computed(() => [
  ...props.selected.flatMap((key) => props.options.filter((option) => option.key === key)),
  ...props.options.filter((option) => !props.selected.includes(option.key)),
]);
const selectedLabels = computed(() =>
  orderedOptions.value
    .filter((option) => props.selected.includes(option.key))
    .map((option) => option.title)
    .join(', '),
);
const toggle = (key: IssueColumnKey, checked: boolean) => {
  emit('change', checked
    ? [...props.selected, key]
    : props.selected.filter((item) => item !== key));
};

watch(open, async (isOpen) => {
  sortable?.destroy();
  sortable = undefined;
  if (!isOpen) return;
  await nextTick();
  if (!open.value || !listRoot.value) return;
  sortable = Sortable.create(listRoot.value, {
    draggable: '.issue-columns-option',
    dataIdAttr: 'data-column',
    handle: '.issue-columns-drag',
    animation: 150,
    ghostClass: 'issue-columns-ghost',
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 5,
    delay: 300,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    onStart: () => {
      orderBeforeDrag = orderedOptions.value.map((option) => option.key);
    },
    onEnd: ({ oldIndex, newIndex }) => {
      if (!listRoot.value) return;
      const reordered = Array.from(listRoot.value.children)
        .map((element) => (element as HTMLElement).dataset.column as IssueColumnKey);
      sortable?.sort(orderBeforeDrag, false);
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

      const visible = new Set(reordered);
      emit('change', [
        ...reordered.filter((key) => props.selected.includes(key)),
        ...props.selected.filter((key) => !visible.has(key)),
      ]);
    },
  });
});
onBeforeUnmount(() => sortable?.destroy());
</script>
