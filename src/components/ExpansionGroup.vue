<template>
  <div ref="menuRef" class="menu scrollable-content">
    <component
      :is="item.component"
      v-for="item in visibleItems"
      :key="item.id"
      :data-id="item.id"
      :class="{ 'draggable-item': !item.isLocked }"
      v-bind="item.props"
      :ref="(el) => setItemRef(item.id, el)"
      v-on="item.listeners || {}"
    />
    <q-banner v-if="isDev()" rounded class="bg-orange text-white flex-shrink-0">
      <b>Внимание!</b> Вы находитесь на активно разрабатываемой версии АИПлана.
      Сохранность данных не гарантируется.
    </q-banner>
  </div>
</template>

<script setup lang="ts">
//core
import { computed, ref, markRaw, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { LocalStorage } from 'quasar';

//composables
import { useSortable } from 'src/composables/useSortable';
import { useExpansionGroupResize } from 'src/composables/useExpansionGroupResize';

//stores
import { useUtilsStore } from 'src/stores/utils-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

//utils
import { isDev } from 'src/utils/helpers';

// components
import NavMenuProjects from './menu/NavMenuProjects.vue';
import NavMenuForms from './menu/NavMenuForms.vue';
import NavMenuBottomBarHelpAndSupport from 'components/menu/NavMenuBottomBarHelpAndSupport.vue';
import NavMenuAIDocs from './menu/NavMenuAIDocs.vue';
import NavSprints from './menu/NavSprints.vue';
import NavMenuConferencesDemo from './menu/NavMenuConferencesDemo.vue';

//core
const route = useRoute();

//stores
const utilsStore = useUtilsStore();
const workspaceStore = useWorkspaceStore();
const { isDemo, isEnabledJitsi } = storeToRefs(utilsStore);
const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);

//composables
const { hasPermissionByWorkspace } = useRolesStore();

//variables
const menuRef = ref<HTMLElement | null>(null);
const itemRefs = ref<Record<string, any>>({});

const isAIDoc = computed(() => route.fullPath.includes('aidoc'));

//consts
const defaultOrder = [
  'sprints',
  'projects',
  'forms',
  'favorites',
  'docs',
  'jitsi',
  'conferences',
  'help',
];
const ORDER_KEY = `${route.params.workspace}_menuOrder`;
const savedOrder = LocalStorage.getItem<string[]>(ORDER_KEY) || [];

// sortable integration
const { initSortable } = useSortable(menuRef, {
  draggable: '.draggable-item',
  ghostClass: 'menu-ghost',
  animation: 150,
  forceFallback: true,
  fallbackOnBody: true,
  fallbackTolerance: 5,
  filter: '.resizer',
  preventOnFilter: true,
  onEnd: async ({ oldIndex, newIndex }) => {
    if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

    const movedItem = visibleItems.value[oldIndex];
    if (!movedItem) return;

    const visibleListIds = visibleItems.value.map((i) => i.id);
    visibleListIds.splice(oldIndex, 1);
    visibleListIds.splice(newIndex, 0, movedItem.id);

    const newFullOrder: string[] = [];
    let vIndex = 0;

    for (const id of currentOrder.value) {
      if (itemsMap[id].condition()) {
        if (vIndex < visibleListIds.length) {
          newFullOrder.push(visibleListIds[vIndex]);
          vIndex++;
        }
      } else {
        newFullOrder.push(id);
      }
    }
    currentOrder.value = newFullOrder;

    LocalStorage.set(ORDER_KEY, currentOrder.value);
  },
});

const itemsMap: Record<
  string,
  {
    id: string;
    component: any;
    props?: Record<string, any>;
    listeners?: Record<string, Function>;
    condition: () => boolean;
    isLocked?: boolean;
  }
> = {
  sprints: {
    id: 'sprints',
    component: markRaw(NavSprints),
    condition: () =>
      !isAIDoc.value &&
      !!currentWorkspaceSlug.value &&
      hasPermissionByWorkspace(workspaceInfo?.value, 'show-sprints-nav'),
  },
  projects: {
    id: 'projects',
    component: markRaw(NavMenuProjects),
    condition: () => !isAIDoc.value,
  },
  forms: {
    id: 'forms',
    component: markRaw(NavMenuForms),
    condition: () => !isAIDoc.value,
  },
  favorites: {
    id: 'favorites',
    component: markRaw(NavMenuAIDocs),
    props: { filterBy: 'favorites' },
    listeners: { updateFavoriteState },
    condition: () => !!(isAIDoc.value && currentWorkspaceSlug.value),
  },
  docs: {
    id: 'docs',
    component: markRaw(NavMenuAIDocs),
    props: { filterBy: 'docs' },
    condition: () => !!(isAIDoc.value && currentWorkspaceSlug.value),
  },
  conferences: {
    id: 'conferences',
    component: markRaw(NavMenuConferencesDemo),
    condition: () => isDemo.value,
  },
  help: {
    id: 'help',
    component: markRaw(NavMenuBottomBarHelpAndSupport),
    condition: () => true,
    isLocked: true,
  },
};

const mergedOrder = [...savedOrder];
defaultOrder.forEach((id) => {
  if (!mergedOrder.includes(id)) {
    const helpIndex = mergedOrder.indexOf('help');
    if (helpIndex >= 0) {
      mergedOrder.splice(helpIndex, 0, id);
    } else {
      mergedOrder.push(id);
    }
  }
});

const validOrderSpy = mergedOrder.filter((id) => itemsMap[id]);
const currentOrder = ref<string[]>(
  validOrderSpy.length ? validOrderSpy : defaultOrder,
);

const visibleItems = computed(() => {
  return currentOrder.value
    .map((id) => itemsMap[id])
    .filter((item) => item && item.condition());
});

const setItemRef = (id: string, el: any) => {
  if (el) itemRefs.value[id] = el;
};

function updateFavoriteState(id: string, state: boolean) {
  if (itemRefs.value['docs']) {
    itemRefs.value['docs'].setFavoriteState(id, state);
  }
}

watch(
  () => visibleItems.value.length,
  async () => {
    await initSortable();
  },
  { flush: 'post' },
);

onMounted(async () => {
  await initSortable();
});

const fixedHeightItems = ['help', 'jitsi'];
useExpansionGroupResize(menuRef, 'menuItemsLayout', fixedHeightItems);
</script>

<style scoped lang="scss">
.menu {
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

:deep(.menu-ghost) {
  opacity: 0.5;
  border-top: 2px solid var(--primary);
}
</style>
