<template>
  <div class="aql-history">
    <div class="aql-history__title">
      <span>История запросов</span>
      <q-btn
        v-if="history.length"
        flat
        dense
        class="aql-history__clear"
        aria-label="Очистить историю"
      >
        <BinIcon color="#DC3E3E" :width="16" :height="16" />
        <!-- над кнопкой: под ней открывается подтверждение -->
        <HintTooltip anchor="top middle" self="bottom middle">
          Очистить историю
        </HintTooltip>
        <!-- подтверждение: случайный клик не должен стирать все запросы -->
        <q-menu anchor="bottom right" self="top right" :offset="[0, 4]">
          <div class="aql-history__confirm">
            <span>Очистить историю?</span>
            <q-btn
              v-close-popup
              no-caps
              class="delete-btn aql-history__confirm-btn"
              @click="aqlStore.clearHistory()"
            >
              Очистить
            </q-btn>
          </div>
        </q-menu>
      </q-btn>
    </div>
    <div v-if="history.length" class="aql-history__list scrollable-content">
      <q-list>
        <q-item
          v-for="query in history"
          :key="query"
          clickable
          class="aql-history__item"
          @click="onSelect(query)"
        >
          <span
            :ref="(el) => setQueryEl(query, el as HTMLElement | null)"
            class="aql-history__query"
            >{{ query }}</span
          >
          <HintTooltip
            :model-value="hinted === query"
            anchor="center right"
            self="center left"
            max-width="480px"
            @update:model-value="(shown) => onHint(query, shown)"
          >
            <div class="aql-history__tooltip">{{ query }}</div>
          </HintTooltip>
        </q-item>
      </q-list>
    </div>
    <div v-else class="aql-history__empty">Запросов пока нет</div>
  </div>
</template>

<script setup lang="ts">
// core
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useAqlStore } from 'src/modules/search-issues/aql/stores/aql-store';

// components
import HintTooltip from 'src/components/HintTooltip.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';

const emit = defineEmits<{
  select: [query: string];
}>();

const aqlStore = useAqlStore();
const { history } = storeToRefs(aqlStore);

// запись, над которой открыта подсказка
const hinted = ref<string | null>(null);

const queryEls = new Map<string, HTMLElement>();

const setQueryEl = (query: string, el: HTMLElement | null) => {
  if (el) queryEls.set(query, el);
  else queryEls.delete(query);
};

// запись длиннее трёх строк обрезана — только ей и нужна подсказка
const isCut = (query: string) => {
  const el = queryEls.get(query);
  return !!el && el.scrollHeight > el.clientHeight + 1;
};

const onHint = (query: string, shown: boolean) => {
  if (!shown) {
    if (hinted.value === query) hinted.value = null;
    return;
  }
  if (isCut(query)) hinted.value = query;
};

// выбранная запись уезжает наверх списка из-под указателя, и событие ухода
// мыши к ней не приходит — подсказку прячем сами
const onSelect = (query: string) => {
  hinted.value = null;
  emit('select', query);
};
</script>

<style scoped lang="scss">
.aql-history {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// высота строки задана под кнопку: с корзиной и без неё заголовок не прыгает
.aql-history__title {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 6px 2px 10px;
  font-size: 12px;
  line-height: 16px;
  color: $sub-text-color;
}

.aql-history__confirm {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 8px 12px;
  font-size: 13px;
  white-space: nowrap;
}

.aql-history__confirm-btn {
  min-height: 32px;
}

.aql-history__list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 2px 10px 2px;
}

.aql-history__item {
  min-height: 0;
  padding: 6px 8px;
  border-radius: 8px;
}

.aql-history__query {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  width: 100%;
  font-family: monospace;
  font-size: 12px;
  line-height: 16px;
  word-break: break-word;
  color: $text-color;
}

.aql-history__tooltip {
  max-height: 60vh;
  overflow: hidden;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.aql-history__empty {
  padding: 0 10px;
  font-size: 13px;
  color: $sub-text-color;
}
</style>
