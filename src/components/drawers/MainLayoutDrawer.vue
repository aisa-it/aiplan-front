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
    class="sidebar scrollable-content disable-x-scroll main-nav-bar"
    @update:model-value="(value) => emits('update:drawer-open', value)"
    @before-show="updateClientWidth"
    @mouseenter="isBtnShow = true"
    @mouseleave="isBtnShow = false"
  >
    <NavMenu></NavMenu>
    <div class="handle-resize" @pointerdown="onPointerDown"></div>
    <div class="absolute" style="top: 15px; right: -10px">
      <q-btn
        v-show="isBtnShow && !isOverlay"
        class="drawer-btn"
        :icon="!leftDrawerOpen ? 'chevron_right' : 'chevron_left'"
        @click="onDrawerBtnClick"
      />
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { LocalStorage, Screen, useQuasar } from 'quasar';
import { computed, ref, toRefs, watch } from 'vue';

// services
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import NavMenu from 'components/NavMenu.vue';
import { useRoute } from 'vue-router';
import { useUIStore } from 'src/stores/ui-store';
import { storeToRefs } from 'pinia';
import { useDrawerResize } from 'src/composables/useDrawerResize';

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const emits = defineEmits<{
  'update:drawer-open': [value: boolean];
  close: [];
}>();

const leftDrawerOpen = ref(true);
const isBtnShow = ref(false);

const onDrawerBtnClick = () => emits('close');

const $q = useQuasar();
const route = useRoute();

const uiStore = useUIStore();

const props = withDefaults(
  defineProps<{
    drawerOpen: boolean;
  }>(),
  {
    drawerOpen: false,
  },
);
const { drawerOpen } = toRefs(props);

const { menuSidebarWidth } = storeToRefs(uiStore);

const defaultWidth = 300;
const clientWidth = ref(document.documentElement.clientWidth);
const minWidth = computed(() => defaultWidth);
const maxWidth = computed(() =>
  isMobile.value ? defaultWidth : clientWidth.value / 2,
);
const { adaptiveWidth, onPointerDown, updateClientWidth } = useDrawerResize(
  minWidth,
  maxWidth,
  clientWidth,
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
      emits('close');
    } else {
      emits('update:drawer-open', true);
    }
  },
  { immediate: true },
);

watch(
  () => drawerOpen.value,
  () => {
    leftDrawerOpen.value = drawerOpen.value;
  },
  // immediate — чтобы внутреннее состояние совпадало с пропом при монтировании
  // (иначе на мобильных дровер открывался бы при загрузке)
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

watch(currentWorkspaceSlug, (newSlug) => {
  if (newSlug) {
    workspaceStore.getWorkspaceSummary(newSlug);
  }
});
</script>

<style lang="scss" scoped>
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

.drawer-btn {
  z-index: 1000;
}
</style>

<style>
.q-body-scroll-y {
  overflow-y: scroll;
  position: fixed;
}
</style>
