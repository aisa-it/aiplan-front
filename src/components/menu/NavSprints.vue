<template>
  <ExpansionItem full-open is-default-open itemName="project">
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <SprintIcon :is-dark="$q.dark.isActive" />
        </q-item-section>
        <q-item-section>Спринты</q-item-section>
        <q-btn
          flat
          dense
          style="margin-right: 5px"
          :disable="!hasPermission('create-project')"
          @click.stop.prevent
        >
          <q-icon name="add" dense size="18px" />
        </q-btn>
      </div>
    </template>
    <template v-slot:content>
      <q-list
        v-if="workspaceProjects.length > 0 || workspaceInfo"
        :style="{
          overflow: 'scroll',
        }"
        class="scrollable-content"
      >
        <q-item
          v-for="sprint in mockSprints"
          :key="sprint.id"
          class="menu-link__item row items-center"
          tag="a"
          target="_self"
          :active="
            $route.params.project === sprint.identifier ||
            $route.params.project === sprint.id
          "
          :to="`/${currentWorkspaceSlug || workspaceInfo?.slug}/sprints/${
            sprint.id
          }/LED`"
        >
          <q-item-section avatar>
            <!--     <q-circular-progress
              show-value
              font-size="12px"
              :value="sprint.progress"
              size="30px"
              :thickness="0.15"
              color="primary"
              track-color="red-5"
            >
              <p class="text-subtitle2 q-ma-none" style="font-size: 10px">
                {{ sprint.progress }}%
              </p>
            </q-circular-progress> -->

            <StatusCircularProgressBar
              style="width: 35px"
              :issuesCount="sprint.issuesCount"
              :state-distribution="{ ...sprint.progress }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="abbriviated-text">
              {{ sprint.title }}
            </q-item-label>
            <HintTooltip
              anchor="bottom start"
              self="bottom start"
              :offset="[0, 42]"
            >
              {{ sprint.title }}
            </HintTooltip>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';
import ExpansionItem from '../ExpansionItem.vue';

import NavAddProjectButton from './NavAddProjectButton.vue';
import SprintIcon from '../icons/SprintIcon.vue';
import StatusCircularProgressBar from '../progress-bars/StatusCircularProgressBar.vue';

const mockSprints = [
  {
    id: 'sprint-1',
    identifier: 'FRO-001',
    title: 'Sprint 1: Initial Setup',
    issuesCount: 6,
    progress: {
      started: 1,
      completed: 2,
      cancelled: 3,
    },
  },
  {
    id: 'sprint-2',
    identifier: 'FRO-002',
    title: 'Sprint 2: Core Features',
    issuesCount: 6,
    progress: {
      started: 2,
      completed: 4,
      cancelled: 0,
    },
  },
  {
    id: 'sprint-3',
    identifier: 'FRO-003',
    title: 'Sprint 3: UI Improvements',
    issuesCount: 14,
    progress: {
      started: 2,
      completed: 5,
      cancelled: 7,
    },
  },
  {
    id: 'sprint-4',
    identifier: 'FRO-004',
    title: 'Sprint 4: Testing & QA',
    issuesCount: 2,
    progress: {
      started: 1,
      completed: 0,
      cancelled: 1,
    },
  },
  {
    id: 'sprint-5',
    identifier: 'FRO-005',
    title: 'Sprint 5: Release Prep',
    issuesCount: 0,
    progress: {
      started: 0,
      completed: 0,
      cancelled: 0,
    },
  },
];

// stores
const workspaceStore = useWorkspaceStore();
const { hasPermission } = useRolesStore();

// store to refs
const { workspaceInfo, workspaceProjects, currentWorkspaceSlug } =
  storeToRefs(workspaceStore);
</script>
