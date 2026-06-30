<template>
  <div ref="menuRef" class="menu scrollable-content">
    <q-item
      clickable
      v-ripple
      :active="route.name === 'workspace'"
      :to="{
        name: 'workspace',
        params: { workspace: currentWorkspaceSlug },
      }"
      class="menu-item"
    >
      <q-item-section avatar>
        <HomeIcon :color="route.name === 'workspace' ? '#3f75ff' : ''" />
      </q-item-section>

      <q-item-section> Главная </q-item-section>
    </q-item>
    <component
      :is="item.component"
      v-for="item in visibleItems"
      :key="item.id"
      :data-id="item.id"
      :class="{
        'draggable-item': !item.isLocked,
      }"
      v-bind="item.props"
      :ref="(el) => setItemRef(item.id, el)"
      v-on="item.listeners || {}"
    />

    <q-item
      :active="route.path.includes('/aidoc')"
      clickable
      v-ripple
      @click="router.push(`/${currentWorkspaceSlug}/aidoc`)"
      class="menu-item"
    >
      <q-item-section avatar>
        <AIDocIcon :color="route.path.includes('/aidoc') ? '#3f75ff' : ''" />
      </q-item-section>

      <q-item-section> АИДок </q-item-section>
    </q-item>

    <component
      :is="HelpItem.component"
      :key="HelpItem.id"
      :data-id="HelpItem.id"
      :class="{
        'draggable-item': !HelpItem.isLocked,
      }"
      :ref="(el) => setItemRef(HelpItem.id, el)"
      class="help-item"
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
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { LocalStorage } from 'quasar';

//composables
import { useSortable } from 'src/composables/useSortable';
import { useExpansionGroupResize } from 'src/composables/useExpansionGroupResize';

//stores
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

//utils
import { isDev } from 'src/utils/helpers';

//types
import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts.ts';

// components
import NavMenuProjects from './menu/NavMenuProjects.vue';
import NavMenuForms from './menu/NavMenuForms.vue';
import NavMenuBottomBarHelpAndSupport from 'components/menu/NavMenuBottomBarHelpAndSupport.vue';
import NavSprints from './menu/NavSprints.vue';

import HomeIcon from './icons/HomeIcon.vue';
import AIDocIcon from './icons/AIDocIcon.vue';

//core
const route = useRoute();
const router = useRouter();

//stores
const workspaceStore = useWorkspaceStore();
const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);

//composables
const { hasPermissionByWorkspace } = useRolesStore();

//variables
const menuRef = ref<HTMLElement | null>(null);
const itemRefs = ref<Record<string, any>>({});

const isAIDoc = computed(() => route.fullPath.includes('aidoc'));

//consts
const defaultOrder = ['projects', 'sprints', 'forms'];
const OLD_ORDER_KEY = `${route.params.workspace}_menuOrder`;
const ORDER_KEY = computed(() => `${route.params.workspace}_menu`);
const savedOrder = computed(
  () => LocalStorage.getItem<string[]>(ORDER_KEY.value) || [],
);

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

    const movedItem = visibleItems.value[oldIndex - 1];

    if (!movedItem) return;

    const visibleListIds = visibleItems.value.map((i) => i.id);
    visibleListIds.splice(oldIndex - 1, 1);
    visibleListIds.splice(newIndex - 1, 0, movedItem.id);

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

    LocalStorage.set(ORDER_KEY.value, currentOrder.value);
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
  projects: {
    id: 'projects',
    component: markRaw(NavMenuProjects),
    condition: () => !isAIDoc.value,
  },
  sprints: {
    id: 'sprints',
    component: markRaw(NavSprints),
    condition: () =>
      !isAIDoc.value &&
      !!currentWorkspaceSlug.value &&
      hasPermissionByWorkspace(
        workspaceInfo?.value as DtoWorkspace,
        'show-sprints-nav',
      ),
  },
  forms: {
    id: 'forms',
    component: markRaw(NavMenuForms),
    condition: () =>
      !isAIDoc.value &&
      !!currentWorkspaceSlug.value &&
      hasPermissionByWorkspace(workspaceInfo?.value, 'show-forms-nav'),
  },
  // conferences: {
  //   id: 'conferences',
  //   component: markRaw(NavMenuConferencesDemo),
  //   condition: () => isDemo.value,
  // },
};

const HelpItem = {
  id: 'help',
  component: markRaw(NavMenuBottomBarHelpAndSupport),
  condition: () => true,
  isLocked: true,
};

const mergedOrder = [...savedOrder.value];
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

watch(
  () => visibleItems.value.length,
  async () => {
    await initSortable();
  },
  { flush: 'post' },
);

onMounted(async () => {
  await initSortable();

  // очистка старого порядка меню у старых пользователей 30.06.26, можно убрать когда пройдет некоторое время
  LocalStorage.removeItem(OLD_ORDER_KEY);
});

const fixedHeightItems = ['help', 'jitsi'];
useExpansionGroupResize(menuRef, 'menuItemsLayout', fixedHeightItems);
</script>

<style scoped lang="scss">
.menu {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.help-item {
  margin-top: auto;
}

:deep(.menu-ghost) {
  opacity: 0.5;
  border-top: 2px solid var(--primary);
}
</style>
