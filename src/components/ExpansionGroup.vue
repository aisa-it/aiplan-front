<template>
  <div class="menu scrollable-content">
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
import { computed, ref, provide, reactive } from 'vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';

export type MenuItem = {
  id: string;
  el: HTMLElement;
  minHeight: number;
};

const route = useRoute();
const utilsStore = useUtilsStore();
const workspaceStore = useWorkspaceStore();
const { isDemo, isEnabledJitsi } = storeToRefs(utilsStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const docsMenu = ref();

const items = reactive<MenuItem[]>([]);
const heights = reactive(new Map<string, number | null>());

const isAIDoc = computed(() => route.fullPath.includes('aidoc'));

const updateFavoriteState = (id: string, state: boolean) => {
  docsMenu.value.setFavoriteState(id, state);
};

const sortItems = () => {
  items.sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
};

const registerItem = (item: MenuItem) => {
  items.push(item);
  sortItems();
  return () => {
    const i = items.findIndex((p) => p.id === item.id);
    if (i >= 0) items.splice(i, 1);
    heights.delete(item.id);
  };
};

const getHeight = (id: string) => {
  return heights.get(id);
};

const setHeight = (id: string, h: number) => {
  heights.set(id, h);
};

const clearHeight = (id: string) => {
  heights.set(id, null);
};

const resizeBy = (id: string, deltaPx: number) => {
  sortItems();

  const i = items.findIndex((p) => p.id === id);
  if (i <= 0) return;

  const cur = items[i];
  const prev = items[i - 1];

  const curH = heights.get(cur.id) ?? cur.el.getBoundingClientRect().height;
  const prevH = heights.get(prev.id) ?? prev.el.getBoundingClientRect().height;

  let nextCurHeight = curH + deltaPx;
  let nextPrevHeight = prevH - deltaPx;

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

  heights.set(cur.id, nextCurHeight);
  heights.set(prev.id, nextPrevHeight);
};

provide('menuItems', {
  registerItem,
  getHeight,
  setHeight,
  clearHeight,
  resizeBy,
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
</style>
