<template>
  <NavMenuHeader />
  <div
    v-if="loadingMenu === false"
    class="nav-menu-bottom-bar"
    data-tour="sidebar"
    style="height: calc(100vh - 50px)"
  >
    <ExpansionGroup></ExpansionGroup>
  </div>
  <div v-else>
    <div :style="{ maxWidth: `${sidebarWidth ?? 300}px` }">
      <q-item>
        <q-item-section>
          <q-skeleton type="QRange" />
        </q-item-section>
      </q-item>

      <q-item v-for="i in 5" :key="i">
        <q-item-section avatar>
          <q-skeleton type="QCheckbox" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="rect" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-skeleton type="QRange" />
        </q-item-section>
      </q-item>

      <q-item v-for="i in 5" :key="i">
        <q-item-section avatar>
          <q-skeleton size="40px" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="rect" />
          </q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
// nav menu components
import ExpansionGroup from 'src/components/ExpansionGroup.vue';
import NavMenuHeader from './menu/NavMenuHeader.vue';

import { useFormStore } from 'src/stores/form-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { computed, onMounted, ref } from 'vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRoute } from 'vue-router';
import { getFormList } from './forms/services/api';
import { LocalStorage } from 'quasar';

const formStore = useFormStore();
const sprintStore = useSprintStore();
const workspaceStore = useWorkspaceStore();
const loadingMenu = ref(true);

const route = useRoute();
const slug = route.params.workspace as string;
const sidebarWidth = computed(() => LocalStorage.getItem('menuSidebarWidth'));
onMounted(async () => {
  try {
    await workspaceStore.getWorkspaceProjects(slug);
    await sprintStore.getSprintsList(slug);
    await getFormList(slug).then((res) => (formStore.forms = res));
  } catch {
  } finally {
    loadingMenu.value = false;
  }
});
</script>
