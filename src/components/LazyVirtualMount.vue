<template>
  <div ref="root">
    <transition name="fade" mode="out-in">
      <div v-if="shouldRender">
        <div ref="content">
          <slot />
        </div>
      </div>
    </transition>

    <div
      v-if="!shouldRender"
      :style="{
        height: measuredHeight + 'px',
        overflow: 'hidden',
        position: 'relative',
      }"
    >
      <slot name="fallback" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps<{
  active: boolean;
  estimatedHeight?: number;
  scrollContainer: HTMLElement | null;
}>();

const root = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const intersecting = ref(false);
const shouldRender = ref(false);

const UNMOUNT_DELAY = 250;
let unmountTimer: number | null = null;

const measuredHeight = ref(props.estimatedHeight ?? 600);

let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;

const apllyIntersectionObserver = (container: HTMLElement | null) => {
  io = new IntersectionObserver(
    ([entry]) => {
      intersecting.value = entry.isIntersecting;
    },
    {
      root: container ?? null,
      rootMargin: `${container?.getClientRects()[0].height ?? 1200}px 0px`,
    },
  );

  root.value && io.observe(root.value);
};

onMounted(() => {
  apllyIntersectionObserver(props.scrollContainer);

  ro = new ResizeObserver(() => {
    if (content.value) {
      measuredHeight.value = content.value.offsetHeight;
    }
  });
});

watch(
  () => props.scrollContainer,
  (container) => {
    io?.disconnect();

    apllyIntersectionObserver(container);
  },
  { immediate: true },
);

watch(
  () => props.active,
  (isActive) => {
    if (unmountTimer) {
      clearTimeout(unmountTimer);
      unmountTimer = null;
    }

    if (isActive) shouldRender.value = true;

    if (!isActive) {
      setTimeout(() => {
        shouldRender.value = false;
      }, UNMOUNT_DELAY);
    }
  },
);

watch(
  () => intersecting.value,
  (isIntersecting) => {
    if (!props.active) return;

    if (isIntersecting) {
      if (unmountTimer) {
        clearTimeout(unmountTimer);
        unmountTimer = null;
      }

      shouldRender.value = true;
    } else {
      unmountTimer = window.setTimeout(() => {
        shouldRender.value = false;
        unmountTimer = null;
      }, UNMOUNT_DELAY);
    }
  },
);

watch(shouldRender, async (v) => {
  if (v) {
    await nextTick();
    if (content.value) {
      ro?.observe(content.value);
    }
  } else {
    ro?.disconnect();
  }
});

onBeforeUnmount(() => {
  io?.disconnect();
  ro?.disconnect();

  if (unmountTimer) {
    clearTimeout(unmountTimer);
  }
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: height 200ms ease;
}
</style>
