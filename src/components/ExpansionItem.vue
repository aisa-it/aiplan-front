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
    :style="{
      minHeight: minHeight + 'px',
      height: isExpanded ? heightStyle : minHeight + 'px',
      maxHeight: isExpanded ? heightStyle : minHeight + 'px',
    }"
  >
    <div v-show="fullOpen" ref="resizerRef" class="resizer"></div>
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
import { EventBus, useQuasar } from 'quasar';
import { MenuItem } from './ExpansionGroup.vue';

const props = defineProps<{
  fullOpen?: boolean;
  type?: string;
  isDefaultOpen?: boolean;
  isExpanding?: boolean;
  itemName: string;
  isOpenDisable?: boolean;
}>();

const $q = useQuasar();
const bus = inject('bus') as EventBus;
const menuItems = inject<{
  resizeBy: (id: string, deltaPx: number) => void;
  getHeight: (id: string) => number | undefined;
  setHeight: (id: string, height: number) => void;
  clearHeight: (id: string) => void;
  registerItem: (item: MenuItem) => () => void;
}>('menuItems');

const id = props.itemName;
const menuItemRef = ref<HTMLElement | null>(null);
const resizerRef = ref<HTMLElement | null>(null);

const isExpanded = ref(props.isDefaultOpen ?? false);
const minHeight = computed(() =>
  isExpanded.value ? MIN_HEIGHT_EXPANDED : MIN_HEIGHT,
);

let regItem: null | (() => void) = null;

const height = computed(() => menuItems?.getHeight(id));
const heightStyle = computed(() => (height.value ? `${height.value}px` : '100%'));

const MIN_HEIGHT = 40;
const MIN_HEIGHT_EXPANDED = 80;
let startY = 0;
let dragging = false;

function onPointerDown(e: PointerEvent) {
  if (!menuItems) return;
  if (!menuItemRef.value) return;

  dragging = true;
  startY = e.clientY;

  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging || !menuItems) return;

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
  if ($q.platform.is?.mobile === true) {
    bus.emit('open', props.itemName);
  }

  isExpanded.value = !isExpanded.value;
  menuItems?.clearHeight?.(id);
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
  regItem = menuItems.registerItem({
    id,
    el: menuItemRef.value,
    minHeight: minHeight.value,
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

  regItem?.();
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

watch(minHeight, (mh) => {
  regItem?.();
  if (menuItemRef.value && menuItems) {
    regItem = menuItems.registerItem({
      id,
      el: menuItemRef.value,
      minHeight: mh,
    });
  }
});

defineExpose({
  isExpanded,
});
</script>
<style scoped>
.menu-item--expanded {
  overflow: scroll;
  flex: 1 1 auto;
}
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
