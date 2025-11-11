<template>
  <div
    class="q-table__title abbriviated-text"
    :style="' max-width: calc(100% - 60px)'"
  >
    <transition name="fade">
      <span v-if="!isLoadProjectInfo && currentProjectID">
        Задачи проекта {{ project?.name }}
      </span>
    </transition>

    <q-skeleton
      v-if="isLoadProjectInfo"
      text
      style="width: 300px"
      animation="blink"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';

const projectStore = useProjectStore();

const { currentProjectID, project, isLoadProjectInfo } =
  storeToRefs(projectStore);
</script>
