<template>
  <q-drawer
    v-model="drawer"
    show-if-above
    :mini="!drawer || miniState"
    :width="200"
    :breakpoint="500"
    bordered
    class="main-nav-bar"
  >
    <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
      <q-list padding>
        <q-item
          clickable
          v-ripple
          :active="route.name === 'workspace'"
          :to="{
            name: 'workspace',
            params: { workspace: currentWorkspaceSlug },
          }"
        >
          <q-item-section avatar>
            <HomeIcon />
          </q-item-section>

          <q-item-section> Главная </q-item-section>
        </q-item>

        <q-item
          :active="route.name === 'projects'"
          clickable
          v-ripple
          @click="router.push(`/${currentWorkspaceSlug}/projects`)"
        >
          <q-item-section avatar>
            <MenuProjectsIcon :is-dark="$q.dark.isActive" />
          </q-item-section>

          <q-item-section> Проекты </q-item-section>
        </q-item>

        <q-item
          :active="route.name === 'sprints'"
          clickable
          v-ripple
          :to="{
            name: 'sprints',
          }"
        >
          <q-item-section avatar>
            <SprintIcon />
          </q-item-section>

          <q-item-section> Спринты </q-item-section>
        </q-item>

        <q-item
          :active="route.path.includes('/forms')"
          clickable
          v-ripple
          @click="router.push(`/${currentWorkspaceSlug}/forms`)"
        >
          <q-item-section avatar>
            <MenuFormsIcon :is-dark="$q.dark.isActive" />
          </q-item-section>

          <q-item-section> Формы </q-item-section>
        </q-item>

        <q-item
          :active="route.path.includes('/aidoc')"
          clickable
          v-ripple
          @click="router.push(`/${currentWorkspaceSlug}/aidoc`)"
        >
          <q-item-section avatar>
            <AIDocIcon />
          </q-item-section>

          <q-item-section> АИДок </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>

    <div class="absolute" style="top: 15px; right: -10px">
      <q-btn
        class="drawer-btn"
        :icon="miniState ? 'chevron_right' : 'chevron_left'"
        @click="drawerClick"
      />
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

// icons
import HomeIcon from '../icons/HomeIcon.vue';
import AIDocIcon from '../icons/AIDocIcon.vue';
import SprintIcon from '../icons/SprintIcon.vue';
import MenuFormsIcon from '../icons/MenuFormsIcon.vue';
import MenuProjectsIcon from '../icons/MenuProjectsIcon.vue';

import { useWorkspaceStore } from 'src/stores/workspace-store';

const $q = useQuasar();
const miniState = ref(false);
const drawer = ref(true);
const router = useRouter();
const route = useRoute();

const drawerClick = () => (miniState.value = !miniState.value);

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
</script>
