<template>
  <NavMenuHeader />
  <div class="nav-menu-bottom-bar" :style="{ height: defineHeight }">
    <ExpansionGroup></ExpansionGroup>
  </div>
  <q-banner v-if="isDev()" rounded class="bg-orange text-white">
    <b>Внимание!</b> Вы находитесь на активно разрабатываемой версии АИПлана.
    Сохранность данных не гарантируется.
  </q-banner>
</template>

<script lang="ts" setup>
// core
import { computed } from 'vue';

// nav menu components
import ExpansionGroup from 'src/components/ExpansionGroup.vue';
import NavMenuHeader from './menu/NavMenuHeader.vue';

import { isDev } from 'src/utils/helpers';

const defineHeight = computed(() => {
  return isDev() ? 'calc(100vh - 96px - 50px)' : 'calc(100vh - 50px)';
});
</script>
