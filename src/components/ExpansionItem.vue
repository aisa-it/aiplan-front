<template>
  <div
    ref="menuItemRef"
    class="scrollable-content relative-position"
    :class="[
      'menu-item',
      isExpanded ? 'menu-item--open' : 'menu-item--closed',
      defineClass(),
    ]"
    :style="
      !isMobile && {
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
import { ref, watch, inject, onMounted, computed } from 'vue';
import ArrowUp from './icons/ArrowUp.vue';
import { EventBus, Screen } from 'quasar';
import { useExpansionItemResize } from 'src/composables/useExpansionItemResize';

const props = defineProps<{
  fullOpen?: boolean;
  type?: string;
  isDefaultOpen?: boolean;
  isExpanding?: boolean;
  itemName: string;
  isOpenDisable?: boolean;
}>();

const bus = inject('bus') as EventBus;

const MIN_HEIGHT = 40;
const MIN_HEIGHT_EXPANDED = 136;

const id = props.itemName;
const menuItemRef = ref<HTMLElement | null>(null);
const resizerRef = ref<HTMLElement | null>(null);
const isMobile = computed(() => Screen.width <= 650);
const isExpanded = ref(props.isDefaultOpen ?? false);

const minHeight = computed(() => {
  let height;
  switch (props.type) {
    case 'help':
      height = 234;
      break;
    case 'jitsi':
      height = Screen.height > 700 ? 450 : 300;
      break;
    default:
      height = MIN_HEIGHT_EXPANDED;
  }
  return isExpanded.value ? height : MIN_HEIGHT;
});

const isResizable = computed(
  () =>
    props.fullOpen &&
    !isMobile.value &&
    isExpanded.value &&
    menuItemRef?.value?.previousElementSibling,
);

const { height, isOpen } = useExpansionItemResize(
  id,
  menuItemRef,
  resizerRef,
  isExpanded,
  minHeight,
);

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
watch(
  isOpen,
  (open) => {
    if (!isMobile.value) {
      isExpanded.value = open ?? false;
    }
  },
  { immediate: true },
);

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
