<template>
  <div ref="containerRef" class="week-grid__events">
    <template v-for="(event, i) in events" :key="event.id">
      <EventItem
        v-if="visibleCount === 0 || i < visibleCount"
        :ref="(el) => (eventRefs[i] = el as EventItemInstance)"
        :event="event"
      />
    </template>

    <MoreItem
      v-if="hiddenCount > 0"
      :hidden-count="hiddenCount"
      :events="hiddenEvents"
      :day="day"
      :ref="(comp) => (moreRef = (comp as MoreItemInstance)?.el ?? null)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue';
import { CalendarEvent } from '../../types/calendar';
import EventItem from '../event/EventItem.vue';
import type EventItemComponent from '../event/EventItem.vue';
import MoreItem from '../event//MoreItem.vue';
import type MoreItemComponent from '../event//MoreItem.vue';

type EventItemInstance = InstanceType<typeof EventItemComponent>;
type MoreItemInstance = InstanceType<typeof MoreItemComponent>;

const props = defineProps<{
  events: CalendarEvent[];
  day: Date;
}>();

const containerRef = ref<HTMLElement | null>(null);
const eventRefs = ref<EventItemInstance[]>([]);
const moreRef = ref<HTMLElement | null>(null);
const ro = ref<ResizeObserver | null>(null);

const visibleCount = ref(0);
const hiddenCount = computed(() =>
  Math.max(0, props.events.length - visibleCount.value),
);

const hiddenEvents = computed(() => props.events.slice(visibleCount.value));

onMounted(() => {
  if (!containerRef.value) return;
  ro.value = new ResizeObserver(nextTickCalculate);
  ro.value.observe(containerRef.value);
});

onUnmounted(() => {
  if (ro.value && containerRef.value) {
    ro.value.unobserve(containerRef.value);
    ro.value.disconnect();
    ro.value = null;
  }
});

watch(
  () => props.events,
  async () => {
    visibleCount.value = props.events.length;
    await nextTick();
    calculate();
  },
  { flush: 'post' },
);

function nextTickCalculate() {
  visibleCount.value = 0;
  return nextTick(() => {
    calculate();
  });
}

function calculate() {
  if (!containerRef.value) return;

  const containerHeight = containerRef.value.clientHeight;
  const moreHeight = moreRef.value?.offsetHeight ?? 0;

  let usedHeight = 16;
  let count = 0;
  const gap = 4;

  for (const item of eventRefs.value) {
    const el = item?.el;
    if (!el) continue;

    const h = el.offsetHeight;

    if (usedHeight + h + gap + moreHeight > containerHeight) break;

    usedHeight += h + gap;
    count++;
  }

  visibleCount.value = count;
}
</script>

<style lang="scss" scoped>
.week-grid__events {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
}
</style>
