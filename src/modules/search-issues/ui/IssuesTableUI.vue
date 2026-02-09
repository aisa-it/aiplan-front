<template>
  <q-table
    :pagination="localPagination"
    v-model:selected="localSelected"
    :rows="rows"
    :columns="visibleColumns"
    :loading="loading"
    :selection="selection"
    row-key="id"
    flat
    :hide-no-data="true"
    @request="(e) => emits('request', e.pagination)"
    @row-click="(_, row) => route(row)"
    class="sprint-checkboxes my-sticky-column-table search-filters-table table-bottom-reverse"
    :class="{ 'table-scroll-off': isCreateSprint }"
  >
    <template #bottom>
      <PaginationDefault
        v-if="paginationInsideMode"
        v-model:selected-page="localPagination.page"
        v-model:rows-per-page="localPagination.rowsPerPage"
        :rows-number="localPagination.rowsNumber"
        show-rows-per-page
        @request="
          (partial) =>
            emits('request', {
              ...localPagination,
              ...partial,
            })
        "
      />
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <div
          style="
            text-overflow: ellipsis;
            overflow: hidden;
            font-size: 0.813rem;
            line-height: 1.25rem;
          "
        >
          <span v-html="parseBoldText(props.value)" />
          <HintTooltip>
            <span v-html="parseBoldText(props.value)"
          /></HintTooltip>
        </div>
        <div v-if="showDescHighlighted(props.row.desc_highlighted)">
          <span
            class="desc-highlighted"
            v-html="
              getDescHighlightedText(
                parseBoldText(props.row.desc_highlighted),
                undefined,
                true,
              )
            "
          />
          <HintTooltip>
            <span
              v-html="
                getDescHighlightedText(
                  parseBoldText(props.row.desc_highlighted),
                )
              "
          /></HintTooltip>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-state="props">
      <q-td :props="props">
        <div
          class="centered-horisontally"
          style="max-width: 190px; min-width: 100px"
        >
          <q-badge
            rounded
            class="q-mr-sm"
            :style="{ backgroundColor: props.value.color }"
            style="height: 12px; width: 12px"
          />
          <span class="abbriviated-text">
            {{ props.value.name }}
          </span>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-author="props">
      <q-td :props="props">
        <AvatarImage
          :key="props.value.name"
          :tooltip="aiplan.UserName(props.value).join(' ')"
          :text="
            [
              aiplan.UserName(props.value)[0]?.at(0),
              aiplan.UserName(props.value)[1]?.at(0),
            ].join(' ')
          "
          :image="props.value.avatar_id"
          :member="props.value"
        ></AvatarImage>
      </q-td>
    </template>

    <template v-slot:body-cell-assignees="props">
      <q-td :props="props" style="position: relative">
        <AvatarImage
          v-for="(l, n) in props.value"
          :style="{ zIndex: props.value.length - n }"
          class="overlapping"
          :key="l.name"
          :tooltip="aiplan.UserName(l).join(' ')"
          :text="
            [aiplan.UserName(l)[0]?.at(0), aiplan.UserName(l)[1]?.at(0)].join(
              ' ',
            )
          "
          :image="l.avatar_id"
          :member="l"
        ></AvatarImage>
      </q-td>
    </template>

    <template v-slot:body-cell-priority="props">
      <q-td :props="props">
        <div
          v-if="props.value"
          class="centered-horisontally"
          style="max-width: 190px; min-width: 100px"
        >
          <PrioritySingleIcon :type="props.value" />
          <span class="q-ml-xs">{{ p[props.value] }}</span>
        </div>
        <div v-else>Не выбран</div>
      </q-td>
    </template>

    <template v-slot:body-cell-labels="props">
      <q-td :props="props">
        <div class="row no-wrap" style="gap: 4px">
          <q-badge
            v-for="l in props.value"
            :key="l?.name"
            class="q-ml-xs overflow-hidden"
            :style="['background-color: ' + l.color, 'max-width: 200px']"
          >
            <span class="abbriviated-text">
              {{ l?.name }}
              <HintTooltip>
                {{ l?.name }}
              </HintTooltip>
            </span>
          </q-badge>
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Screen } from 'quasar';

import AvatarImage from 'src/components/AvatarImage.vue';
import PrioritySingleIcon from 'src/components/icons/PrioritySingleIcon.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';

import aiplan from 'src/utils/aiplan';
import { parseBoldText } from 'src/utils/helpers';

const props = defineProps<{
  rows: any[];
  visibleColumns: any[];
  loading: boolean;

  pagination?: {
    page: number;
    rowsPerPage: number;
    rowsNumber: number;
    sortBy: string | null;
    descending: boolean;
  };

  paginationInsideMode?: boolean;

  selection?: 'single' | 'multiple' | 'none';
  selectedRows?: any[];

  isCreateSprint?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:selectedRows', val: any[]): void;

  (e: 'request', pagination: any): void;
}>();

const initPagination = {
  sortBy: null,
  descending: true,
  page: 1,
  rowsPerPage: Screen.height > 720 ? 10 : 5,
  rowsNumber: 0,
};

const localPagination = ref(props.pagination ?? initPagination);

watch(
  () => props.pagination,
  (newP) => {
    if (newP) localPagination.value = newP;
  },
);

const localSelected = computed({
  get: () => props.selectedRows,
  set: (val) => emits('update:selectedRows', val),
});

const p = {
  urgent: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  null: 'Нет',
};

const router = useRouter();

const route = (row) => {
  const routeData = router.resolve(
    `/${row.workspace_detail?.slug}/projects/${row.project_detail?.id}/issues/${row.id}`,
  );
  window.open(routeData.href, '_blank');
};

const showDescHighlighted = (text: string) => {
  return text && parseBoldText(text)?.includes('<b>');
};

const getDescHighlightedText = (
  text?: string,
  maxLength = 110,
  showMatchesCount = false,
) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  let truncatedText = text.substring(0, maxLength);
  const isLetterOrDigit = (char: string) => /^[\p{L}\p{N}]$/u.test(char);
  let lastValidIndex = -1;

  for (let i = truncatedText.length - 1; i >= 0; i--) {
    if (!isLetterOrDigit(truncatedText[i])) {
      lastValidIndex = i;
      break;
    }
  }
  truncatedText = truncatedText.substring(0, lastValidIndex + 1);

  const remainingText = text.substring(maxLength);
  const matches = remainingText.match(/<b>/g);

  return matches && showMatchesCount
    ? truncatedText +
        `... и ещё <b>${matches.length}</b> ${getWordForm(matches.length)}`
    : truncatedText;
};

const getWordForm = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'совпадений';
  } else {
    switch (lastDigit) {
      case 1:
        return 'совпадение';
      case 2:
      case 3:
      case 4:
        return 'совпадения';
      default:
        return 'совпадений';
    }
  }
};
</script>

<style lang="scss" scoped>
:deep(.q-table__progress) {
  display: none;
}

.my-sticky-column-table {
  ::-webkit-scrollbar {
    display: block;
  }
}

.search-filters-table :deep(.q-checkbox__inner--truthy .q-checkbox__bg),
.search-filters-table :deep(.q-checkbox__inner--indet .q-checkbox__bg) {
  background: $primary !important;
  border-color: $primary !important;
}

.search-filters-table
  :deep(.q-checkbox__inner--truthy .q-checkbox__svg path.q-checkbox__truthy),
.search-filters-table
  :deep(.q-checkbox__inner--indet .q-checkbox__svg path.q-checkbox__indet) {
  stroke: white !important;
}

.search-filters-table :deep(.q-checkbox__inner--truthy),
.search-filters-table :deep(.q-checkbox__inner--indet) {
  color: $primary !important;
}

:deep(.table-scroll-off.search-filters-table) {
  max-height: none;
}

.desc-highlighted {
  display: inline-block;
  text-wrap: wrap;
  line-height: 0.85rem;
  color: $sub-text-color;
}

:deep(.desc-highlighted b) {
  color: $text-color;
}

.search-filters-table {
  max-height: 76vh;
  @media (max-width: 768px) {
    max-height: 72vh;
  }
  @media (max-width: 500px) {
    max-height: 66vh;
  }
}
@supports (-moz-appearance: none) {
  .search-filters-table .q-table__middle {
    scrollbar-width: thin;
  }
}
</style>
