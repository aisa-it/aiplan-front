<template>
  <div
    v-if="isOverlay && leftDrawerOpen"
    class="fullscreen q-drawer__backdrop"
    style="background-color: rgba(0, 0, 0, 0.4)"
    @click="emits('update:drawer-open', false)"
  ></div>
  <q-drawer
    :model-value="leftDrawerOpen"
    :behavior="isMobile ? 'mobile' : 'desktop'"
    :overlay="isOverlay"
    :width="isMobile ? defaultWidth : adaptiveWidth"
    class="sidebar scrollable-content disable-x-scroll relative-position"
    @update:model-value="(value) => emits('update:drawer-open', value)"
    @before-show="updateClientWidth"
  >
    <NavMenu></NavMenu>
    <div class="handle-resize" @pointerdown="onPointerDown"></div>
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { LocalStorage, Screen, useQuasar } from 'quasar';
import { computed, ref, toRefs, watch } from 'vue';

// components
import NavMenu from 'components/NavMenu.vue';
import { useRoute } from 'vue-router';
import { useUIStore } from 'src/stores/ui-store';
import { storeToRefs } from 'pinia';
import { useDrawerResize } from 'src/composables/useDrawerResize';

const props = withDefaults(
  defineProps<{
    drawerOpen: boolean;
  }>(),
  {
    drawerOpen: false,
  },
);

const emits = defineEmits<{
  'update:drawer-open': [value: boolean];
}>();

const { drawerOpen: leftDrawerOpen } = toRefs(props);

const $q = useQuasar();
const route = useRoute();

const uiStore = useUIStore();

const { menuSidebarWidth, previewIssueWidth } = storeToRefs(uiStore);

const defaultWidth = 300;

const minWidth = computed(() => defaultWidth);
const maxWidth = computed(() =>
  isMobile.value ? defaultWidth : document.documentElement.clientWidth / 2,
);
const { adaptiveWidth, onPointerDown, updateClientWidth } = useDrawerResize(
  previewIssueWidth,
  minWidth,
  maxWidth,
  'menuSidebarWidth',
  'left',
);

const isOverlay = ref(false);

const isMobile = computed(() => {
  return $q.platform.is.mobile && Screen.lt.md;
});

watch(
  () => Screen.lt.md,
  (newValue) => {
    isOverlay.value = newValue;
    if (isOverlay.value || isMobile.value) {
      emits('update:drawer-open', false);
    } else {
      emits('update:drawer-open', true);
    }
  },
  { immediate: true },
);

watch(
  () => leftDrawerOpen.value,
  (newValue) => {
    if (isMobile.value) return;

    const documentBody = document.body;

    if (documentBody.classList.contains('q-body-scroll-y')) {
      const topValue = parseInt(documentBody.style.top || '0', 10);
      documentBody.classList.remove('q-body-scroll-y');
      documentBody.style.removeProperty('top');
      window.scrollTo(0, -topValue);
    }

    if (isOverlay.value && newValue) {
      const scrollY = window.scrollY;
      documentBody.style.top = `-${scrollY}px`;
      documentBody.classList.add('q-body-scroll-y');
    }
    if (newValue) {
      menuSidebarWidth.value =
        LocalStorage.getItem('menuSidebarWidth') ?? defaultWidth;
    } else {
      menuSidebarWidth.value = 0;
    }
  },
  { immediate: true },
);

watch(
  () => route.path,
  () => {
    if (isOverlay.value) {
      emits('update:drawer-open', false);
    }
  },
  { immediate: true },
);

watch(adaptiveWidth, (width) => {
  if (leftDrawerOpen.value) menuSidebarWidth.value = width;
});
</script>

<style scoped>
:deep(.disable-x-scroll) {
  overflow-x: hidden;
}

.handle-resize {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 6px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}
</style>

<style>
.q-body-scroll-y {
  overflow-y: scroll;
  position: fixed;
}
</style>
