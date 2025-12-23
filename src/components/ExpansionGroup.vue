<template>
  <div ref="menuRef" class="menu scrollable-content">
    <NavSprints v-if="!isAIDoc && currentWorkspaceSlug" />
    <NavMenuProjects v-if="!isAIDoc" />
    <NavMenuForms v-if="!isAIDoc" />
    <NavMenuAIDocs
      v-if="isAIDoc && currentWorkspaceSlug"
      filterBy="favorites"
      @updateFavoriteState="updateFavoriteState"
    />
    <NavMenuAIDocs
      v-if="isAIDoc && currentWorkspaceSlug"
      ref="docsMenu"
      filterBy="docs"
    />
    <JitsiDialog v-if="!isDemo && isEnabledJitsi"></JitsiDialog>
    <q-item v-if="isDemo" clickable class="menu-item centered-horisontally">
      <q-item-section avatar> <UsersIcon /> </q-item-section>
      <q-item-section> Конференции </q-item-section>
      <HintTooltip>
        Функционал конференций доступен в полной версии
      </HintTooltip>
    </q-item>
    <NavMenuBottomBarHelpAndSupport />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';

import UsersIcon from 'src/components/icons/UsersIcon.vue';

import JitsiDialog from './dialogs/JitsiDialog.vue';
import NavMenuProjects from './menu/NavMenuProjects.vue';
import NavMenuForms from './menu/NavMenuForms.vue';
import NavMenuBottomBarHelpAndSupport from 'components/menu/NavMenuBottomBarHelpAndSupport.vue';
import NavMenuAIDocs from './menu/NavMenuAIDocs.vue';
import NavSprints from './menu/NavSprints.vue';
import { useRoute } from 'vue-router';
import {
  computed,
  ref,
  provide,
  reactive,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { LocalStorage, Screen } from 'quasar';
import { MenuItem, MenuLayout } from 'src/interfaces/ui';

const route = useRoute();
const utilsStore = useUtilsStore();
const workspaceStore = useWorkspaceStore();
const { isDemo, isEnabledJitsi } = storeToRefs(utilsStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const docsMenu = ref();
const items = reactive<MenuItem[]>([]);
const heights = reactive(new Map<string, number>());
let resizeObserver: ResizeObserver | null = null;

const isAIDoc = computed(() => route.fullPath.includes('aidoc'));
const isMobile = computed(() => Screen.width <= 650);

const updateFavoriteState = (id: string, state: boolean) => {
  docsMenu.value.setFavoriteState(id, state);
};
const menuRef = ref<HTMLElement | null>(null);
const loadLayout = (): MenuLayout => {
  const raw = LocalStorage.getItem('menuItemsLayout');
  if (raw && typeof raw === 'object') return raw as MenuLayout;
  return { weights: {}, open: {} };
};

const saveLayout = (layout: MenuLayout) => {
  LocalStorage.set('menuItemsLayout', layout);
};

const saveWeights = () => {
  const layout = loadLayout();
  for (const it of items) layout.weights[it.id] = it.weight;
  saveLayout(layout);
};
const sortItems = () => {
  items.sort((a, b) => {
    if (a.el === b.el) return 0;
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
};
const registerItem = (item: Omit<MenuItem, 'weight'> & { weight?: number }) => {
  const idx = items.findIndex((p) => p.id === item.id);
  if (idx !== -1) items.splice(idx, 1);
  const layout = loadLayout();

  const savedWeight = layout.weights[item.id];
  const weight = Number.isFinite(savedWeight)
    ? savedWeight
    : (item.weight ?? 1);
  const open = isMobile.value ? item.open : (layout.open[item.id] ?? item.open);

  items.push({ ...item, open, weight: Math.max(0, weight) });
  sortItems();
  updateHeight();
};
const unregisterItem = (id: string) => {
  const idx = items.findIndex((p) => p.id === id);
  if (idx !== -1) items.splice(idx, 1);
  heights.delete(id);
  updateHeight();
};
const updateItem = (
  id: string,
  patch: Partial<Pick<MenuItem, 'minHeight' | 'open'>>,
) => {
  const it = items.find((x) => x.id === id);
  if (!it) return;
  if (patch.minHeight !== undefined) it.minHeight = patch.minHeight;
  if (patch.open !== undefined) {
    it.open = patch.open;
    if (!isMobile.value) {
      const layout = loadLayout();
      layout.open[id] = it.open;
      saveLayout(layout);
    }
  }
  updateHeight();
};
const getHeight = (id: string) => heights.get(id);
const getMenuHeight = () => menuRef.value?.getBoundingClientRect().height ?? 0;
const findPrevOpenIndex = (from: number) => {
  for (let i = from - 1; i >= 0; i--) {
    if (items[i].open) return i;
  }
  return -1;
};
const updateHeight = () => {
  sortItems();
  const menuHeight = getMenuHeight();
  if (menuHeight <= 0 || items.length === 0) return;
  const sumMinHeight = items.reduce((s, item) => s + item.minHeight, 0);
  const availableHeight = Math.max(0, menuHeight - sumMinHeight);
  const openItems = items.filter((item) => item.open);
  const sumWeight = openItems.reduce(
    (s, item) => s + Math.max(0, item.weight),
    0,
  );
  for (const item of items) {
    let extra = 0;
    if (availableHeight > 0 && item.open) {
      const weight = Math.max(0, item.weight);
      extra =
        sumWeight > 0
          ? (availableHeight * weight) / sumWeight
          : availableHeight / openItems.length || 0;
    }
    heights.set(item.id, item.minHeight + extra);
  }
};
const resizeBy = (id: string, deltaPx: number, withSave = true) => {
  sortItems();
  const i = items.findIndex((p) => p.id === id);
  if (i <= 0) return;
  const cur = items[i];
  const prevI = findPrevOpenIndex(i);
  if (prevI < 0) return;

  const prev = items[prevI];
  if (!cur.open || !prev.open) return;
  updateHeight();
  const curHeight = heights.get(cur.id) ?? cur.minHeight;
  const prevHeight = heights.get(prev.id) ?? prev.minHeight;
  let nextCurHeight = curHeight + deltaPx;
  let nextPrevHeight = prevHeight - deltaPx;
  if (nextCurHeight < cur.minHeight) {
    const diff = cur.minHeight - nextCurHeight;
    nextCurHeight = cur.minHeight;
    nextPrevHeight -= diff;
  }
  if (nextPrevHeight < prev.minHeight) {
    const diff = prev.minHeight - nextPrevHeight;
    nextPrevHeight = prev.minHeight;
    nextCurHeight -= diff;
  }
  if (nextCurHeight < cur.minHeight || nextPrevHeight < prev.minHeight) return;
  const menuHeight = getMenuHeight();
  const sumMinHeight = items.reduce((s, it) => s + it.minHeight, 0);
  const availableHeight = Math.max(0, menuHeight - sumMinHeight);
  if (availableHeight <= 0) return;
  const openItems = items.filter((it) => it.open);
  const sumWeight =
    openItems.reduce((s, it) => s + Math.max(0, it.weight), 0) || 1;
  const curExtraHeight = Math.max(0, curHeight - cur.minHeight);
  const prevExtraHeight = Math.max(0, prevHeight - prev.minHeight);
  const nextCurExtraHeight = Math.max(0, nextCurHeight - cur.minHeight);
  const nextPrevExtraHeight = Math.max(0, nextPrevHeight - prev.minHeight);
  const curWeight = (curExtraHeight * sumWeight) / availableHeight;
  const prevWeight = (prevExtraHeight * sumWeight) / availableHeight;
  const nextCurWeight = (nextCurExtraHeight * sumWeight) / availableHeight;
  const nextPrevWeight = (nextPrevExtraHeight * sumWeight) / availableHeight;
  cur.weight = Math.max(0, cur.weight + (nextCurWeight - curWeight));
  prev.weight = Math.max(0, prev.weight + (nextPrevWeight - prevWeight));
  updateHeight();
  if (withSave) saveWeights();
};
onMounted(() => {
  if (menuRef.value) {
    resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(menuRef.value);
  }
  updateHeight();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

provide('menuItems', {
  registerItem,
  unregisterItem,
  updateItem,
  getHeight,
  resizeBy,
  loadLayout,
});
</script>
<style scoped>
.menu {
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.menu-item:first-child .menu-item--expanded {
  margin-bottom: auto;
}
</style>
