<template>
  <Teleport to="body">
    <div
      ref="rootRef"
      class="aql-suggest"
      :style="style"
      role="listbox"
      @mousedown.prevent
    >
      <div class="aql-suggest__list scrollable-content">
        <div
          v-for="(item, index) in items"
          :key="`${item.label}|${item.insert}`"
          :ref="(el) => setItemEl(index, el as HTMLElement | null)"
          class="aql-suggest__item"
          :class="{ 'aql-suggest__item--selected': index === selected }"
          role="option"
          :aria-selected="index === selected"
          @click="emits('pick', index)"
        >
          <q-avatar
            v-if="item.user"
            size="22px"
            class="aql-suggest__avatar"
            :class="{ 'aql-suggest__avatar--empty': !item.user.avatarId }"
          >
            <q-img
              v-if="item.user.avatarId"
              :src="getUrlFile(item.user.avatarId)"
              spinner-size="22px"
            >
              <template #error>
                <div class="aql-suggest__initials">
                  {{ item.user.initials }}
                </div>
              </template>
            </q-img>
            <div v-else class="aql-suggest__initials">
              {{ item.user.initials }}
            </div>
          </q-avatar>
          <span class="aql-suggest__label">{{ item.label }}</span>
          <span v-if="item.hint" class="aql-suggest__hint">{{
            item.hint
          }}</span>
        </div>
      </div>
      <div v-if="footer" class="aql-suggest__footer">{{ footer }}</div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { getUrlFile } from 'src/utils/helpers';

import type { AqlSuggestItem } from '../utils/suggest';

const props = defineProps<{
  items: AqlSuggestItem[];
  // выбранная строка; -1 — ничего не выбрано
  selected: number;
  // каретка в координатах окна
  anchor: { left: number; top: number; bottom: number };
  footer?: string;
}>();

const emits = defineEmits<{
  pick: [index: number];
}>();

const GAP = 4;
const EDGE = 8;

const rootRef = ref<HTMLElement | null>(null);
const itemEls: (HTMLElement | null)[] = [];
const size = ref({ width: 0, height: 0 });

const setItemEl = (index: number, el: HTMLElement | null) => {
  itemEls[index] = el;
};

// Под кареткой; не помещается — над ней. По ширине не вылезает за окно
const style = computed(() => {
  const { width, height } = size.value;
  const below = props.anchor.bottom + GAP;
  const fitsBelow = below + height <= window.innerHeight - EDGE;
  const top = fitsBelow
    ? below
    : Math.max(props.anchor.top - GAP - height, EDGE);
  const left = Math.max(
    Math.min(props.anchor.left, window.innerWidth - width - EDGE),
    EDGE,
  );
  return { left: `${left}px`, top: `${top}px` };
});

const measure = () => {
  const root = rootRef.value;
  if (root) size.value = { width: root.offsetWidth, height: root.offsetHeight };
};

onMounted(measure);
watch(
  () => [props.items, props.footer],
  () => nextTick(measure),
);

watch(
  () => props.selected,
  (index) => itemEls[index]?.scrollIntoView({ block: 'nearest' }),
  { flush: 'post' },
);
</script>

<style scoped lang="scss">
.aql-suggest {
  position: fixed;
  // выше окна поиска и окна фильтра
  z-index: 7000;
  min-width: 220px;
  max-width: 420px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
  color: var(--text-color);
  font-size: 13px;
  line-height: 20px;
}

.aql-suggest__list {
  max-height: 248px;
  overflow-y: auto;
  padding: 4px;
}

.aql-suggest__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;

  &:hover,
  &--selected {
    background: var(--aql-suggest-selected, rgba(63, 117, 255, 0.14));
  }
}

.aql-suggest__label {
  flex-shrink: 0;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aql-suggest__hint {
  margin-left: auto;
  padding-left: 12px;
  overflow: hidden;
  color: var(--sub-text-color);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aql-suggest__avatar {
  flex-shrink: 0;

  &--empty {
    background: #ccdbff;
    color: var(--primary);
  }
}

.aql-suggest__initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 9px;
  line-height: 9px;
  letter-spacing: 0.5px;
}

.aql-suggest__footer {
  padding: 4px 12px 6px;
  border-top: 1px solid var(--border-color);
  color: var(--sub-text-color);
  font-size: 12px;
}
</style>
