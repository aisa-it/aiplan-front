<template>
  <div v-if="step" class="fixed inset-0 z-[9999] pointer-events-none">
    <svg
      class="absolute inset-0 w-full h-full"
      :style="{ pointerEvents: 'auto' }"
      aria-hidden="true"
    >
      <defs>
        <mask id="hole-mask" maskUnits="userSpaceOnUse">
          <rect :width="docWidth" :height="docHeight" fill="white" />
          <rect
            :x="hole.x"
            :y="hole.y"
            :width="hole.w"
            :height="hole.h"
            :rx="hole.radius"
            fill="black"
          />
        </mask>
      </defs>

      <rect
        :width="docWidth"
        :height="docHeight"
        :fill="overlayColor"
        mask="url(#hole-mask)"
        class="pointer-events-auto"
      />
    </svg>

    <div
      class="absolute rounded-lg pointer-events-none transition-[top,left,width,height] duration-[280ms] ease-[ease]"
      :style="{
        top: hole.y + 'px',
        left: hole.x + 'px',
        width: hole.w + 'px',
        height: hole.h + 'px',
        borderRadius: hole.radius + 'px',
      }"
    />

    <div
      ref="popoverEl"
      class="absolute w-[544px] bg-white text-gray-900 p-6 rounded-2xl z-[10000] pointer-events-auto border border-solid border-gray-200"
      :style="popoverStyle"
    >
      <p class="mb-[14px] font-bold w-full">{{ step.title }}</p>
      <p class="text-base" v-html="step.text"></p>
      <ul class="pl-6 flex flex-col gap-2">
        <li
          class="text-base leading-[22px] tracking-[0.5px]"
          v-for="item in step.textList"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
      <div class="mt-6 flex gap-[14px] items-center">
        <v-btn
          variant="flat"
          color="primary"
          :text="step.activeButtonText"
          @click="nextStep"
        />
        <v-btn
          v-if="step.is_skip"
          variant="outlined"
          color="primary"
          text="Пропустить"
          @click="endTour"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { type Step } from './types/step';
import { useGuiderStore } from './guider-store';

const props = defineProps<{
  steps: Step[];
  stepNum: number;
}>();

const emits = defineEmits<{
  endTutorial: [];
}>();

const guiderStore = useGuiderStore();

guiderStore.setActiveGuid(props.stepNum);

const current = ref(0);
const step = ref<Step | null>(null);

const overlayColor = 'rgba(71, 74, 82, 0.5)';

const docWidth = ref(window.innerWidth);
const docHeight = ref(window.innerHeight);

const hole = reactive({ x: 0, y: 0, w: 0, h: 0, radius: 8 });

const popoverStyle = ref<Record<string, any>>({});

const popoverEl = ref<HTMLElement | null>(null);

let mutationObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId = 0;

const scheduleUpdate = () => {
  cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(async () => {
    await nextTick();
    await attemptFindAndPosition();
  });
};

const observeTarget = () => {
  resizeObserver?.disconnect();

  if (!step.value?.el) return;

  const targets = document.querySelectorAll<HTMLElement>(step.value.el);

  if (!targets.length) return;

  const observer = new ResizeObserver(() => {
    scheduleUpdate();
  });

  targets.forEach((target) => observer.observe(target));

  resizeObserver = observer;
};

const observeDom = () => {
  mutationObserver?.disconnect();

  mutationObserver = new MutationObserver(() => {
    scheduleUpdate();
  });

  mutationObserver.observe(document.body, {
    subtree: true,
    childList: true,
  });
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const updatePosition = () => {
  if (!step.value) return;

  const placement = step.value.placement ?? {
    mode: 'screen',
    primary: 'center',
    align: 'center',
  };

  if (!popoverEl.value) return;

  const popoverSize = popoverEl.value.getBoundingClientRect();
  if (!popoverSize) return;

  const popoverWidth = popoverSize.width;
  const popoverHeight = popoverSize.height;

  const gap = 12;

  if (!step.value.el || placement.mode === 'screen') {
    hole.x = 0;
    hole.y = 0;
    hole.w = 0;
    hole.h = 0;

    popoverStyle.value = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
    return;
  }

  const elements = document.querySelectorAll(step.value.el);
  if (!elements.length) return;

  const rects = Array.from(elements).map((el) => el.getBoundingClientRect());

  const minX = Math.min(...rects.map((r) => r.left));
  const minY = Math.min(...rects.map((r) => r.top));
  const maxX = Math.max(...rects.map((r) => r.right));
  const maxY = Math.max(...rects.map((r) => r.bottom));

  const padding = step.value.padding ?? 0;

  const anchor = {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    w: Math.max(0, maxX - minX + padding * 2),
    h: Math.max(0, maxY - minY + padding * 2),
  };

  hole.x = anchor.x;
  hole.y = anchor.y;
  hole.w = anchor.w;
  hole.h = anchor.h;
  hole.radius = 8;

  let left = 0;
  let top = 0;

  const { mode, primary, align = 'center' } = placement;

  if (mode === 'outside') {
    switch (primary) {
      case 'top':
        top = anchor.y - popoverHeight - gap;
        break;
      case 'bottom':
        top = anchor.y + anchor.h + gap;
        break;
      case 'left':
        left = anchor.x - popoverWidth - gap;
        break;
      case 'right':
        left = anchor.x + anchor.w + gap;
        break;
      case 'center':
        left = anchor.x + anchor.w / 2 - popoverWidth / 2;
        top = anchor.y + anchor.h / 2 - popoverHeight / 2;
        break;
    }
  }

  if (mode === 'inside') {
    switch (primary) {
      case 'top':
        top = anchor.y;
        break;
      case 'bottom':
        top = anchor.y + anchor.h - popoverHeight;
        break;
      case 'left':
        left = anchor.x;
        break;
      case 'right':
        left = anchor.x + anchor.w - popoverWidth;
        break;
      case 'center':
        left = anchor.x + anchor.w / 2 - popoverWidth / 2;
        top = anchor.y + anchor.h / 2 - popoverHeight / 2;
        break;
    }
  }

  const isVertical = primary === 'top' || primary === 'bottom';

  const isHorizontal = primary === 'left' || primary === 'right';

  if (isVertical) {
    switch (align) {
      case 'start':
        left = anchor.x;
        break;
      case 'center':
        left = anchor.x + anchor.w / 2 - popoverWidth / 2;
        break;
      case 'end':
        left = anchor.x + anchor.w - popoverWidth;
        break;
    }
  }

  if (isHorizontal) {
    switch (align) {
      case 'start':
        top = anchor.y;
        break;
      case 'center':
        top = anchor.y + anchor.h / 2 - popoverHeight / 2;
        break;
      case 'end':
        top = anchor.y + anchor.h - popoverHeight;
        break;
    }
  }

  left += placement.offset?.x ?? 0;
  top += placement.offset?.y ?? 0;

  left = clamp(left, 0, window.innerWidth - popoverWidth);
  top = clamp(top, 0, window.innerHeight - popoverHeight);

  popoverStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  };
};

const attemptFindAndPosition = async () => {
  if (!step.value) return;
  if (!step.value.el) return updatePosition();

  const target = (document.querySelector(step.value.el) as HTMLElement) ?? null;

  const rect = target?.getBoundingClientRect();
  if (
    rect &&
    (rect.top < 0 || rect.bottom > window.innerHeight) &&
    !step.value.isOffScroll
  ) {
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await nextTick();
    docWidth.value = window.innerWidth;
    docHeight.value = window.innerHeight;
    updatePosition();
  } else {
    updatePosition();
  }
  observeTarget();

  mutationObserver?.disconnect();
  mutationObserver = null;
};

const nextStep = async () => {
  if (step.value?.onLeave) {
    step.value?.onLeave?.();
  }

  if (current.value < props.steps.length) {
    step.value = props.steps[current.value];
    current.value++;
    if (step.value?.onEnter) {
      step.value?.onEnter?.();
    }

    await nextTick();

    await attemptFindAndPosition();
  } else {
    endTour();
  }
};

const endTour = () => {
  step.value = null;
  current.value = 0;
  guiderStore.clear();
  emits('endTutorial');
};

const onResize = () => {
  docWidth.value = window.innerWidth;
  docHeight.value = window.innerHeight;
  updatePosition();
};
const onScroll = () => {
  updatePosition();
};

onMounted(() => {
  nextStep();

  observeDom();

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, true);
});

onBeforeUnmount(() => {
  mutationObserver?.disconnect();
  resizeObserver?.disconnect();
  cancelAnimationFrame(rafId);

  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', onScroll, true);
});
</script>
