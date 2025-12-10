<template>
  <div v-if="step" class="onboarding-root">
    <svg
      class="overlay-svg"
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
        class="overlay-rect"
      />
    </svg>

    <div
      class="hole-outline"
      :style="{
        top: hole.y + 'px',
        left: hole.x + 'px',
        width: hole.w + 'px',
        height: hole.h + 'px',
        borderRadius: hole.radius + 'px',
      }"
    />

    <div class="popover" :style="popoverStyle">
      <p class="base-title text-bold full-w">{{ step.title }}</p>
      <p class="popover__text" v-html="step.text"></p>
      <div class="controls">
        <q-btn
          flat
          dense
          no-caps
          class="primary-btn"
          :label="step.activeButtonText"
          @click="nextStep"
        />
        <q-btn
          v-if="step.is_skip"
          dense
          flat
          no-caps
          color="primary"
          label="Пропустить"
          @click="endTour"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Step } from './types/step';
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

const updatePosition = () => {
  if (!step.value) return;

  if (!step.value.el) {
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

  const rects = Array.from(elements).map((el) => el.getBoundingClientRect());
  const minX = Math.min(...rects.map((r) => r.left));
  const minY = Math.min(...rects.map((r) => r.top));
  const maxX = Math.max(...rects.map((r) => r.right));
  const maxY = Math.max(...rects.map((r) => r.bottom));

  const padding = step.value.padding ?? 0;
  const x = Math.max(0, minX - padding);
  const y = Math.max(0, minY - padding);
  const w = Math.max(0, maxX - minX + padding * 2);
  const h = Math.max(0, maxY - minY + padding * 2);

  hole.x = x;
  hole.y = y;
  hole.w = w;
  hole.h = h;
  hole.radius = 8;

  const pos = step.value.position ?? 'bottom';
  const gap = 12;
  const popoverWidth = 544;
  const popoverHeight = 200;

  switch (pos) {
    case 'right': {
      const top = y + h / 2 - popoverHeight / 2;
      const left = Math.min(x + w + gap, window.innerWidth - popoverWidth - 8);

      popoverStyle.value = {
        top: `${Math.max(8, top)}px`,
        left: `${left}px`,
      };
      break;
    }

    case 'left': {
      const top = y + h / 2 - popoverHeight / 2;
      const left = Math.max(x - popoverWidth - gap, 8);

      popoverStyle.value = {
        top: `${Math.max(8, top)}px`,
        left: `${left}px`,
      };
      break;
    }

    case 'bottom': {
      const screenMiddle = window.innerWidth / 2;
      const isOnLeft = x + w / 2 < screenMiddle;

      let left = isOnLeft ? x : x + w - popoverWidth;

      left = Math.max(0, Math.min(left, window.innerWidth - popoverWidth - 8));

      const top = y + h + gap;

      popoverStyle.value = {
        top: `${Math.min(top, window.innerHeight - popoverHeight - 8)}px`,
        left: `${left}px`,
      };
      break;
    }

    case 'top': {
      const screenMiddle = window.innerWidth / 2;
      const isOnLeft = x + w / 2 < screenMiddle;

      let left = isOnLeft ? x : x + w - popoverWidth;
      left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));

      const top = Math.max(8, y - popoverHeight - gap);

      popoverStyle.value = {
        top: `${top}px`,
        left: `${left}px`,
      };
      break;
    }

    case 'center':
    default: {
      popoverStyle.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
      break;
    }
  }
};

const attemptFindAndPosition = async (tries = 0) => {
  if (!step.value) return;
  if (!step.value.el) return updatePosition();

  const target = (document.querySelector(step.value.el) as HTMLElement) ?? null;

  const rect = target?.getBoundingClientRect();
  if (rect && (rect.top < 0 || rect.bottom > window.innerHeight)) {
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await nextTick();
    docWidth.value = window.innerWidth;
    docHeight.value = window.innerHeight;
    updatePosition();
  } else {
    updatePosition();
  }
};

const nextStep = async () => {
  if (current.value < props.steps.length) {
    step.value = props.steps[current.value];
    current.value++;
    await nextTick();
    attemptFindAndPosition();
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

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', onScroll, true);
});
</script>

<style scoped lang="scss">
.onboarding-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.overlay-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hole-outline {
  position: absolute;
  border-radius: 8px;
  transition:
    top 280ms ease,
    left 280ms ease,
    width 280ms ease,
    height 280ms ease;
  pointer-events: none;
}

.popover {
  position: absolute;
  width: 544px;
  background: $bg-color;
  color: $text-color;
  padding: 24px;
  border-radius: 16px;
  z-index: 10000;
  pointer-events: auto;
  border: 1px solid var(--darkest-border-color);
}

.base-title {
  margin-bottom: 14px;
}

.popover__text {
  font-size: 16px;
}

.controls {
  display: flex;
  gap: 14px;
}

.overlay-rect {
  pointer-events: auto;
}
</style>
