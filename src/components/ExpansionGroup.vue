<template>
  <div ref="menuRef" class="menu scrollable-content">
    <NavSprints
      v-if="
        !isAIDoc &&
        currentWorkspaceSlug &&
        hasPermissionByWorkspace(workspaceInfo, 'show-sprints-nav')
      "
    />
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
    <q-banner v-if="isDev()" rounded class="bg-orange text-white flex-shrink-0">
      <b>Внимание!</b> Вы находитесь на активно разрабатываемой версии АИПлана.
      Сохранность данных не гарантируется.
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';
import { useRolesStore } from 'src/stores/roles-store';

import UsersIcon from 'src/components/icons/UsersIcon.vue';

import JitsiDialog from './dialogs/JitsiDialog.vue';
import NavMenuProjects from './menu/NavMenuProjects.vue';
import NavMenuForms from './menu/NavMenuForms.vue';
import NavMenuBottomBarHelpAndSupport from 'components/menu/NavMenuBottomBarHelpAndSupport.vue';
import NavMenuAIDocs from './menu/NavMenuAIDocs.vue';
import NavSprints from './menu/NavSprints.vue';
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useExpansionGroupResize } from 'src/composables/useExpansionGroupResize';

import { isDev } from 'src/utils/helpers';

const route = useRoute();
const utilsStore = useUtilsStore();
const workspaceStore = useWorkspaceStore();
const { hasPermissionByWorkspace } = useRolesStore();
const { isDemo, isEnabledJitsi } = storeToRefs(utilsStore);
const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);
const docsMenu = ref();

const isAIDoc = computed(() => route.fullPath.includes('aidoc'));

const updateFavoriteState = (id: string, state: boolean) => {
  docsMenu.value.setFavoriteState(id, state);
};
const menuRef = ref<HTMLElement | null>(null);
const fixedHeightItems = ['help', 'jitsi'];
useExpansionGroupResize(menuRef, 'menuItemsLayout', fixedHeightItems);
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
