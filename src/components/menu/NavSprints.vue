<template>
  <ExpansionItem
    full-open
    :is-expanding="sprints.length > 0"
    itemName="sprints"
  >
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <SprintIcon :is-dark="$q.dark.isActive" />
        </q-item-section>
        <q-item-section>Спринты</q-item-section>
        <CreateSprintDialogBtn
          @update-sprints="refreshSprints"
          v-if="hasPermission('create-sprint')"
          @reopen="reopen"
        />
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
          style="padding-top: 0; padding-bottom: 0"
          tag="a"
          target="_self"
          :active="route.params.sprint === sprint.id"
          :to="`/${currentWorkspaceSlug || workspaceInfo?.slug}/sprints/${
            sprint.id
          }`"
        >
          <q-item-section avatar>
            <StatusCircularProgressBar
              style="width: 24px"
              :stats="sprint.stats ?? {}"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="abbriviated-text">
              {{ sprint.name }}
              {{
                getSprintDates(sprint?.start_date ?? '', sprint?.end_date ?? '')
              }}
            </q-item-label>
            <HintTooltip
              anchor="bottom start"
              self="bottom start"
              :offset="[0, 42]"
            >
              {{ sprint.name }}
            </HintTooltip>
          </q-item-section>
          <MenuActions
            v-if="hasPermission('show-sprint-popup')"
            :items="getSprintMenuItems(sprint)"
          />
        </q-item>
      </q-list>
      <CreateSprintDialog
        v-model="openEditSprint"
        :sprint-id="sprintIdForEdit"
        @update-sprints="refreshSprints"
      />
      <DeleteSprintDialog
        v-model="isDeleteDialogOpen"
        :sprint="sprintForDelete"
        @success="successDeleteHandle"
      />
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

import { storeToRefs } from 'pinia';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useNotificationStore } from 'src/stores/notification-store';

import ExpansionItem from '../ExpansionItem.vue';
import SprintIcon from '../icons/SprintIcon.vue';
import StatusCircularProgressBar from '../progress-bars/StatusCircularProgressBar.vue';
import CreateSprintDialogBtn from 'src/modules/sprints/create-sprint-dialog/components/CreateSprintDialogBtn.vue';
import CreateSprintDialog from 'src/modules/sprints/create-sprint-dialog/CreateSprintDialog.vue';
import DeleteSprintDialog from 'src/modules/sprints/delete-sprint-dialog/DeleteSprintDialog.vue';

import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import SettingsIcon from '../icons/SettingsIcon.vue';
import BinIcon from '../icons/BinIcon.vue';
import { getSprintDates } from 'src/modules/sprints/helpres';
import LinkIcon from '../icons/LinkIcon.vue';
import MenuActions from './MenuActions.vue';

const $q = useQuasar();
const workspaceStore = useWorkspaceStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();
const { hasPermission } = useRolesStore();

const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);

const route = useRoute();
const sprints = ref([] as DtoSprintLight[]);

const openEditSprint = ref(false);
const sprintIdForEdit = ref<string>('');
const sprintForDelete = ref<DtoSprintLight | null>(null);
const isDeleteDialogOpen = ref(false);

onMounted(async () => {
  if (!currentWorkspaceSlug.value) return;
  refreshSprints();
});

const refreshSprints = async () => {
  sprints.value = await sprintStore.getSprintsList(currentWorkspaceSlug.value as string)
};

const reopen = async (id: string) => {
  await refreshSprints();
  sprintIdForEdit.value = id as string;
  openEditSprint.value = true;
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const successDeleteHandle = async () => {
  sprintForDelete.value = null;
  showNotification('success', 'Спринт удален');
  await refreshSprints();
};

const getSprintMenuItems = (sprint: DtoSprintLight) => {
  return [
    {
      text: 'Настройки',
      icon: SettingsIcon,
      onClick: () => {
        sprintIdForEdit.value = sprint.id as string;
        openEditSprint.value = true;
      },
    },
    {
      text: 'Скопировать ссылку',
      icon: LinkIcon,
      onClick: () => sprintStore.sprintLinkToClipboard(String(sprint.id)),
    },
    {
      text: 'Удалить спринт',
      icon: BinIcon,
      onClick: () => {
        sprintForDelete.value = sprint ?? null;
        isDeleteDialogOpen.value = true;
      },
    },
  ];
};

watch(currentWorkspaceSlug, async (newValue) => {
  if (!newValue) return;
  sprints.value = await sprintStore.getSprintsList(newValue as string);
});

watch(
  () => sprintStore.refreshSprintData,
  async (v) => {
    if (v) {
      await refreshSprints();
      sprintStore.clearSprintRefresh();
    }
  },
);
</script>
