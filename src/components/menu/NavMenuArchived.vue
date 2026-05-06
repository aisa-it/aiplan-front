<template>
  <ExpansionItem v-if="workspaceArchive.length > 0" full-open is-default-open itemName="project">
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <ArchiveAddIcon />
        </q-item-section>
        <q-item-section>Архив</q-item-section>
      </div>
    </template>
    <template v-slot:content>
      <q-list
        :style="{
          overflow: 'scroll',
        }"
        class="scrollable-content"
      >
        <ArchivedMenuLink
          v-for="project in sortedWorkspaceArchive"
          :key="project.id"
          :emoji="project.emoji ?? ''"
          :link="`/${currentWorkspaceSlug || workspaceInfo?.slug}/projects/${
            project.identifier
          }`"
          :title="project.name"
          :id="project.id"
          :identifier="project.identifier"
          :favorite="project.is_favorite"
          :project="project"
          :workspace-slug="currentWorkspaceSlug"
          :logo="project.logo ?? null"
        />
      </q-list>
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { computed } from 'vue';
import ExpansionItem from '../ExpansionItem.vue';

import ArchiveAddIcon from '../icons/ArchiveAddIcon.vue';

import ArchivedMenuLink from 'src/components/ArchivedMenuLink.vue';

// stores
const workspaceStore = useWorkspaceStore();

// store to refs
const { workspaceInfo, workspaceArchive, currentWorkspaceSlug } =
  storeToRefs(workspaceStore);

const sortedWorkspaceArchive = computed(() =>
  [...workspaceArchive.value].sort((a, b) =>
    b.is_favorite === a.is_favorite ? 0 : b.is_favorite ? 1 : -1,
  ),
);
</script>
