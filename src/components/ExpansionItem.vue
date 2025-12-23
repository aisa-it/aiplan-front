<template>
  <div
    ref="menuItemRef"
    class="scrollable-content relative-position"
    :class="[
      'menu-item',
      isExpanded
        ? props.fullOpen
          ? 'menu-item--expanded'
          : 'menu-item--open'
        : 'menu-item--closed',
      defineClass(),
    ]"
    :style="
      isResizable && {
        minHeight: minHeight + 'px',
        height: (height ?? minHeight) + 'px',
        maxHeight: (height ?? minHeight) + 'px',
      }
    "
  >
    <div v-show="isResizable" ref="resizerRef" class="resizer"></div>
    <div class="menu-item-header" @click="toggleDropdown()">
      <slot name="header" style="cursor: pointer"></slot>
      <ArrowUp
        v-if="!isOpenDisable"
        :class="{ 'rotate-180': isExpanded, 'arrow-up': true }"
      />
    </div>

    <div v-show="isExpanded" class="menu-item-content scrollable-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, onMounted, onBeforeUnmount, computed } from 'vue';
import ArrowUp from './icons/ArrowUp.vue';
import { EventBus, Screen } from 'quasar';
import { MenuItem, MenuLayout } from 'src/interfaces/ui';

const props = defineProps<{
  fullOpen?: boolean;
  type?: string;
  isDefaultOpen?: boolean;
  isExpanding?: boolean;
  itemName: string;
  isOpenDisable?: boolean;
}>();

const bus = inject('bus') as EventBus;
const menuItems = inject<{
  resizeBy: (id: string, deltaPx: number, withSave?: boolean) => void;
  getHeight: (id: string) => number | undefined;
  registerItem: (item: Omit<MenuItem, 'weight'>) => void;
  unregisterItem: (id: string) => void;
  updateItem: (
    id: string,
    patch: { minHeight?: number; open?: boolean },
  ) => void;
  loadLayout: () => MenuLayout;
}>('menuItems');

const id = props.itemName;
const menuItemRef = ref<HTMLElement | null>(null);
const resizerRef = ref<HTMLElement | null>(null);
const isMobile = computed(() => Screen.width <= 650);

const isExpanded = ref(
  isMobile.value
    ? (props.isDefaultOpen ?? false)
    : (menuItems?.loadLayout().open[id] ?? props.isDefaultOpen ?? false),
);

const minHeight = computed(() =>
  isExpanded.value ? MIN_HEIGHT_EXPANDED : MIN_HEIGHT,
);
const height = computed(() => menuItems?.getHeight(id));

const isResizable = computed(
  () => props.fullOpen && !isMobile.value && isExpanded.value,
);

const MIN_HEIGHT = 40;
const MIN_HEIGHT_EXPANDED = 136;
let startY = 0;
let dragging = false;

function onPointerDown(e: PointerEvent) {
  if (!menuItems || !menuItemRef.value || !isExpanded.value) return;

  dragging = true;
  startY = e.clientY;

  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging || !menuItems || !isExpanded.value) return;

  const dy = e.clientY - startY;
  const delta = -dy;
  startY = e.clientY;

  menuItems.resizeBy(id, delta);
}

function onPointerUp(e: PointerEvent) {
  if (!dragging) return;
  dragging = false;

  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {}
}

const toggleDropdown = () => {
  if (props.isOpenDisable) return;
  if (isMobile.value) {
    bus.emit('open', props.itemName);
  }

  isExpanded.value = !isExpanded.value;
};

onMounted(() => {
  bus.on('open', (name) => {
    if (name !== props.itemName) isExpanded.value = false;
  });

  const resizer = resizerRef.value;
  if (resizer) {
    resizer.addEventListener('pointerdown', onPointerDown);
    resizer.addEventListener('pointermove', onPointerMove);
    resizer.addEventListener('pointerup', onPointerUp);
    resizer.addEventListener('pointercancel', onPointerUp);
  }

  if (!menuItemRef.value || !menuItems) return;
  menuItems.registerItem({
    id,
    el: menuItemRef.value,
    minHeight: minHeight.value,
    open: isExpanded.value,
  });
});

onBeforeUnmount(() => {
  const resizer = resizerRef.value;
  if (resizer) {
    resizer.removeEventListener('pointerdown', onPointerDown);
    resizer.removeEventListener('pointermove', onPointerMove);
    resizer.removeEventListener('pointerup', onPointerUp);
    resizer.removeEventListener('pointercancel', onPointerUp);
  }

  menuItems?.unregisterItem(id);
});

const defineClass = () => {
  switch (props.type) {
    case 'help':
      return 'menu-item--help';
    case 'jitsi':
      return 'menu-item--jitsi';
  }
};

watch(
  () => props.isExpanding,
  () => {
    isExpanded.value = props.isExpanding;
  },
);

watch(minHeight, (mh) => menuItems?.updateItem(id, { minHeight: mh }));

watch(isExpanded, (open) => menuItems?.updateItem(id, { open }));

defineExpose({
  isExpanded,
});
</script>
<style scoped>
.resizer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: row-resize;
  background: transparent;
}
</style>
