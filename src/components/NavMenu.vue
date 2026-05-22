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

<script setup lang="ts">
import { LocalStorage } from 'quasar';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import ExpansionGroup from 'src/components/ExpansionGroup.vue';
import NavMenuHeader from './menu/NavMenuHeader.vue';

// stores
import { useFormStore } from 'src/stores/form-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

// api
import { getFormList } from './forms/services/api';

const formStore = useFormStore();
const sprintStore = useSprintStore();
const workspaceStore = useWorkspaceStore();

const loadingMenu = ref(true);

const router = useRouter();
const slug = router.currentRoute.value.params.workspace as string;
const sidebarWidth = computed(() => LocalStorage.getItem('menuSidebarWidth'));

const loadBarInfo = async (slug: string) => {
  try {
    if (!slug) return;
    await workspaceStore.getWorkspaceProjects(slug);
    await sprintStore.getSprintsList(slug);
    await getFormList(slug).then((res) => (formStore.forms = res));
  } catch (e) {
    formStore.forms = [];
    console.error(e);
  } finally {
    loadingMenu.value = false;
  }
};

// первая загрузка, когда заходим по пути воркспейса
onMounted(async () => {
  await loadBarInfo(slug);
});

// при изменении воркспейса подгружаем новые спринты, формы, проекты
router.beforeEach(async (to, from) => {
  if (to.params.workspace === from.params.workspace) return;
  else {
    loadingMenu.value = true;
    await loadBarInfo(to.params.workspace as string);
  }
});
</script>
