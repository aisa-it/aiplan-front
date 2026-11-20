<template>
  <div class="flex min-w-0 items-center gap-1">
    <v-autocomplete
      v-model:menu="menu"
      v-model:search="search"
      :model-value="model"
      :items="items"
      :loading="isLoading"
      :disabled="disabled"
      :label="t('issues.create.chooseTags')"
      :no-data-text="t('issues.create.noTags')"
      item-value="id"
      item-title="name"
      density="compact"
      variant="underlined"
      class="min-w-0"
      chips
      closable-chips
      clear-on-select
      hide-selected
      multiple
      no-filter
      hide-details
      @update:model-value="selectLabels"
    >
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" role="option">
          <template #prepend>
            <span
              class="mr-3 h-3 w-3 shrink-0 rounded-full"
              :style="{ backgroundColor: item.color }"
              aria-hidden="true"
            />
          </template>
        </v-list-item>
      </template>
      <template #chip="{ item, props: chipProps }">
        <v-chip v-bind="chipProps" :title="item.name">
          <span
            class="mr-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: item.color }"
            aria-hidden="true"
          />
          <span class="max-w-36 truncate">{{ item.name }}</span>
        </v-chip>
      </template>
    </v-autocomplete>
    <v-btn
      v-if="canCreate"
      :aria-label="t('issues.create.tagForm.create')"
      :title="t('issues.create.tagForm.create')"
      :disabled="disabled"
      type="button"
      color="icon"
      density="comfortable"
      icon
      variant="text"
      size="small"
      @click="openTagForm"
    >
      <AddIcon aria-hidden="true" />
    </v-btn>
  </div>

  <v-dialog
    v-model="tagFormOpen"
    :persistent="isSaving"
    :aria-label="t('issues.create.tagForm.create')"
    max-width="570"
  >
    <v-card class="issue-tag-card rounded-2xl">
      <v-form
        class="issue-tag-form grid gap-4 p-4"
        validate-on="submit lazy"
        :disabled="isSaving"
        @submit.prevent="saveTag"
      >
        <v-text-field
          v-model="color"
          :aria-label="t('issues.create.tagForm.color')"
          :rules="[validateColor]"
          color="issue-dialog-action"
          density="comfortable"
          variant="underlined"
        >
          <template #prepend-inner>
            <span
              class="mr-1.5 size-3 shrink-0 rounded-full"
              :style="{ backgroundColor: colorPreview }"
              aria-hidden="true"
            />
          </template>
          <template #append-inner>
            <span
              class="relative grid size-6 shrink-0 place-items-center rounded text-secondary focus-within:ring-2 focus-within:ring-current"
              @mousedown.stop
              @click.stop
            >
              <v-icon icon="mdi-eyedropper" size="18" aria-hidden="true" />
              <input
                type="color"
                :value="colorPreview"
                :aria-label="t('issues.create.tagForm.color')"
                :disabled="isSaving"
                class="absolute inset-0 size-full cursor-pointer opacity-0"
                @input="setColorFromPicker"
              />
            </span>
          </template>
        </v-text-field>
        <v-text-field
          v-model="name"
          :label="t('issues.create.tagForm.name')"
          :rules="[validateName]"
          :error-messages="
            isDuplicate ? t('issues.create.tagForm.duplicate') : undefined
          "
          color="issue-dialog-action"
          density="comfortable"
          variant="underlined"
          @update:model-value="isDuplicate = false"
        />
        <div class="grid grid-cols-2 gap-2">
          <v-btn
            type="button"
            color="issue-dialog-action"
            variant="outlined"
            rounded="lg"
            height="40"
            :aria-label="t('common.actions.cancel')"
            :disabled="isSaving"
            @click="tagFormOpen = false"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 8L16 16M16 8L8 16"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </v-btn>
          <v-btn
            type="submit"
            color="issue-dialog-action"
            variant="flat"
            rounded="lg"
            height="40"
            :aria-label="t('common.actions.create')"
            :loading="isSaving"
          >
            <AddIcon color="#FFFFFF" aria-hidden="true" />
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { isAxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import type { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useTheme, type SubmitEventPromise } from 'vuetify';

import AddIcon from '@/components/icons/AddIcon.vue';
import {
  createIssueTag,
  loadCreateIssueTags,
} from '../../api/create-issue-options.source';
import { useCreateIssueOptionSearch } from '../../composables/useCreateIssueOptionSearch';

const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;
const TAG_COLORS = {
  light: [
    '#0E224C',
    '#0E5159',
    '#205024',
    '#6F551C',
    '#664500',
    '#411111',
    '#66214D',
    '#1C3A80',
    '#14757F',
    '#2E7032',
    '#9F792A',
    '#A36100',
    '#7F2222',
    '#963171',
    '#2A52B3',
    '#1A99A5',
    '#3C9040',
    '#CF9D39',
    '#E07D00',
    '#BD3434',
    '#C64195',
    '#1F66FF',
    '#05A5B4',
    '#1DAF22',
    '#FF9200',
    '#FF5F00',
    '#FF0505',
    '#FD0080',
  ],
  dark: [
    '#78A0FF',
    '#34B3BF',
    '#56AA5A',
    '#EAB959',
    '#FF9A20',
    '#E35555',
    '#E35CB0',
    '#9EBCFF',
    '#62C4CD',
    '#7CBE80',
    '#F1CD89',
    '#FFB860',
    '#F08282',
    '#EB82C2',
    '#B1CAFF',
    '#90D5DB',
    '#A2D2A6',
    '#F7E1B9',
    '#FFD6A0',
    '#FFAFAF',
    '#F3A8D4',
    '#6A8DE6',
    '#4AA0A8',
    '#679A6A',
    '#D4B572',
    '#F29A4D',
    '#D15A5A',
    '#D16FA6',
  ],
};

const props = defineProps<{
  workspaceSlug: string;
  projectId: string;
  canCreate?: boolean;
  disabled?: boolean;
}>();

const model = defineModel<string[]>({ required: true });
const { t } = useI18n();
const theme = useTheme();
const scope = computed(() => ({
  workspaceSlug: props.workspaceSlug,
  projectId: props.projectId,
}));

const load = computed(() => {
  const { workspaceSlug, projectId } = scope.value;
  return async (query: string, _offset: number, signal: AbortSignal) => {
    const labels = await loadCreateIssueTags(
      workspaceSlug,
      projectId,
      query,
      signal,
    );
    return { items: labels };
  };
});
const {
  menu,
  search,
  items: matches,
  isLoading,
} = useCreateIssueOptionSearch(load);
const selected = shallowRef<DtoLabelLight[]>([]);
const items = computed(() => {
  const matchedIds = new Set(matches.value.map(({ id }) => id));
  return [
    ...matches.value,
    ...selected.value.filter(
      ({ id }) => id && model.value.includes(id) && !matchedIds.has(id),
    ),
  ];
});

const selectLabels = (ids: string[]) => {
  selected.value = items.value.filter(({ id }) => id && ids.includes(id));
  model.value = ids;
};

const tagFormOpen = ref(false);
const name = ref('');
const color = ref('');
const initialColor = ref('');
const isSaving = ref(false);
const isDuplicate = ref(false);

watch(scope, () => {
  selected.value = [];
  menu.value = false;
  search.value = '';
  tagFormOpen.value = false;
});

const validateName = (value: string) => {
  const length = value.trim().length;
  return (length > 0 && length < 300) || t('issues.create.tagForm.invalidName');
};
const validateColor = (value: string) =>
  HEX_COLOR.test(value.trim()) || t('issues.create.tagForm.invalidColor');

const colorPreview = computed(() => {
  const value = color.value.trim();
  if (!HEX_COLOR.test(value)) return initialColor.value;
  return value.length === 4
    ? value.replace(/[\da-f]/gi, (digit) => digit.repeat(2))
    : value;
});
const setColorFromPicker = (event: Event) => {
  if (event.target instanceof HTMLInputElement)
    color.value = event.target.value;
};

const openTagForm = () => {
  const palette = theme.current.value.dark ? TAG_COLORS.dark : TAG_COLORS.light;
  initialColor.value = palette[Math.floor(Math.random() * palette.length)]!;
  name.value = '';
  color.value = initialColor.value;
  isDuplicate.value = false;
  menu.value = false;
  tagFormOpen.value = true;
};

const saveTag = async (event: SubmitEventPromise) => {
  const { valid } = await event;
  if (
    !valid ||
    isSaving.value ||
    isDuplicate.value ||
    props.disabled ||
    !props.canCreate
  )
    return;

  const requestScope = scope.value;
  isSaving.value = true;
  try {
    const label = await createIssueTag(
      requestScope.workspaceSlug,
      requestScope.projectId,
      {
        name: name.value.trim(),
        color: colorPreview.value,
      },
    );
    if (scope.value !== requestScope) return;
    if (label.id) {
      selected.value = [...selected.value, label];
      model.value = [...new Set([...model.value, label.id])];
    }
    tagFormOpen.value = false;
  } catch (error) {
    if (
      scope.value === requestScope &&
      isAxiosError(error) &&
      error.response?.status === 409
    ) {
      isDuplicate.value = true;
    }
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.issue-tag-card {
  box-shadow: var(--v-issue-dialog-shadow);
}

.issue-tag-form :deep(.v-input__details) {
  min-height: 20px;
}

.issue-tag-form :deep(.v-field:not(.v-field--error) .v-field-label) {
  color: var(--color-secondary);
  opacity: 1;
}

.issue-tag-form
  :deep(
    .v-field:not(.v-field--focused):not(.v-field--error)
      .v-field__outline::before
  ) {
  border-color: rgb(var(--v-theme-border));
  opacity: 1;
}
</style>
