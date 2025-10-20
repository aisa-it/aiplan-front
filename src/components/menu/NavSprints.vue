<template>
  <ExpansionItem
    full-open
    :is-expanding="sprints.length > 0"
    :is-open-disable="sprints.length === 0"
    itemName="sprints"
  >
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <SprintIcon :is-dark="$q.dark.isActive" />
        </q-item-section>
        <q-item-section>Спринты</q-item-section>
        <CreateSprintDialogBtn />
      </div>
    </template>
    <template v-slot:content>
      <q-list
        v-if="sprints.length > 0"
        :style="{
          overflow: 'scroll',
        }"
        class="scrollable-content"
      >
        <q-item
          v-for="sprint in sprints"
          :key="sprint.id"
          class="menu-link__item row items-center"
          tag="a"
          target="_self"
          :active="route.params.sprint === sprint.id"
          :to="`/${currentWorkspaceSlug || workspaceInfo?.slug}/sprints/${
            sprint.id
          }`"
        >
          <q-item-section avatar>
            <StatusCircularProgressBar
              style="width: 35px"
              :stats="sprint.stats ?? {}"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="abbriviated-text">
              {{ sprint.name }}
            </q-item-label>
            <HintTooltip
              anchor="bottom start"
              self="bottom start"
              :offset="[0, 42]"
            >
              {{ sprint.name }}
            </HintTooltip>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { storeToRefs } from 'pinia';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';

import ExpansionItem from '../ExpansionItem.vue';
import SprintIcon from '../icons/SprintIcon.vue';
import StatusCircularProgressBar from '../progress-bars/StatusCircularProgressBar.vue';
import CreateSprintDialogBtn from 'src/modules/sprints/create-sprint-dialog/ui/components/CreateSprintDialogBtn.vue';

import { getSprints } from 'src/modules/sprints/services/api';
import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const workspaceStore = useWorkspaceStore();
const { hasPermission } = useRolesStore();

const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);

const route = useRoute();
const sprints = ref([] as DtoSprintLight[]);

onMounted(async () => {
  sprints.value = await getSprints(route.params.workspace as string);
});

watch(
  () => route.params.workspace,
  async (newValue) => {
    sprints.value = await getSprints(newValue as string);
  },
);
</script>
