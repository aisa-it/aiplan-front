<template>
  <div ref="root">
    <div v-if="visible">
      <div ref="content">
        <slot />
      </div>
    </div>

    <div v-else :style="{ height: measuredHeight + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps<{
  active: boolean;
  estimatedHeight?: number;
}>();

const root = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const visible = ref(false);
const measuredHeight = ref(props.estimatedHeight ?? 600);

let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;

onMounted(() => {
  io = new IntersectionObserver(
    ([entry]) => {
      visible.value = entry.isIntersecting && props.active;
    },
    {
      root: document.querySelector('#grouped-table-target-scroll-container'),
      rootMargin: '300px 0px',
    },
  );

  root.value && io.observe(root.value);

  ro = new ResizeObserver(() => {
    if (content.value) {
      measuredHeight.value = content.value.offsetHeight;
    }
  });
});

watch(visible, async (v) => {
  if (v) {
    await nextTick();
    content.value && ro?.observe(content.value);
  } else {
    ro?.disconnect();
  }
});

onBeforeUnmount(() => {
  io?.disconnect();
  ro?.disconnect();
});
</script>
