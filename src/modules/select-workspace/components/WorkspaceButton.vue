<template>
  <q-btn
    no-caps
    flat
    data-tour="fast-navigation"
    class="btn base-btn"
    style="padding: 0 !important; border: 0 !important"
  >
    <WorkspaceAvatar
      :workspaceName="workspaceName"
      :workspaceLogo="workspaceLogo"
    />

    <q-menu max-width="300px" max-height="600px">
      <q-item
        data-id="create-new-space-button"
        clickable
        :disable="isNewSpaceModalOpen"
        @click="isNewSpaceModalOpen = !isNewSpaceModalOpen"
      >
        <q-item-section> Пространства </q-item-section>

        <q-item-section avatar>
          <q-icon name="add" dense />
        </q-item-section>
      </q-item>

      <q-scroll-area
        :horizontal-offset="[0, 2]"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        style="height: 500px; width: 300px"
      >
        <q-item
          v-for="workspace in userWorkspaces"
          clickable
          exact
          :active="workspace.slug === currentWorkspaceSlug"
          :key="workspace.id"
          :to="`${'/' + workspace.slug}`"
          :class="
            workspace.slug === currentWorkspaceSlug
              ? 'q-router-link--active'
              : ''
          "
        >
          <q-item-section avatar>
            <WorkspaceAvatar
              :workspaceName="workspace.name"
              :workspaceLogo="workspace.logo"
            />
          </q-item-section>

          <q-item-section style="width: 150px">
            <span
              style="
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ workspace.name }}
            </span>
          </q-item-section>

          <q-item-section style="max-width: 16px; margin: 0 8px 0 0">
            <q-btn
              flat
              :class="{ 'favorite-btns--inactive': !workspace.is_favorite }"
              :style="'min-height: 16px !important; min-width: 16px; padding: 0'"
              @click.prevent.stop
            >
              <StarIcon
                :width="16"
                :height="16"
                :color="workspace.is_favorite ? '#F2994A' : ''"
                @click="
                  () =>
                    workspace.is_favorite
                      ? handleRemoveWorkspaceFromFavorites(
                          workspace.id as string,
                        )
                      : handleAddWorkspaceToFavorite(workspace.id as string)
                "
              />
              <HintTooltip v-if="workspace.is_favorite"
                >Убрать из избранного</HintTooltip
              >
              <HintTooltip v-else>Добавить в избранное</HintTooltip>
            </q-btn>
          </q-item-section>

          <q-item-section style="max-width: 18px; margin: 0">
            <MenuActions
              v-if="hasPermissionByWorkspace(workspace, 'ws-settings')"
              :items="workspaceMenuItems(workspace)"
              @click.stop
            />
          </q-item-section>
        </q-item>
      </q-scroll-area>
    </q-menu>
    <NewWorkspaceDialog v-model="isNewSpaceModalOpen" />
    <NotificationsWorkspaceSettingsDialog
      v-model="notificationSettingsOpen"
      :workspace="selectedWorkspace"
    />
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useUserStore } from 'src/stores/user-store';

import { addWorkspaceToFavorite, removeWorkspaceFromFavorites } from '../api';

import WorkspaceAvatar from './WorkspaceAvatar.vue';
import StarIcon from 'src/components/icons/StarIcon.vue';
import BellIcon from 'src/components/icons/BellIcon.vue';
import MenuActions from 'src/components/menu/MenuActions.vue';
import SettingsIcon from 'src/components/icons/SettingsIcon.vue';
import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import NewWorkspaceDialog from 'src/components/dialogs/NewWorkspaceDialog.vue';
import NotificationsWorkspaceSettingsDialog from 'src/components/dialogs/NotificationsWorkspaceSettingsDialog.vue';

const {} = useWorkspaceStore();
const { hasPermissionByWorkspace } = useRolesStore();
const userStore = useUserStore();

const { userWorkspaces } = storeToRefs(userStore);
const { workspaceLogo, workspaceName, currentWorkspaceSlug } =
  storeToRefs(useWorkspaceStore());

const isNewSpaceModalOpen = ref(false);

const selectedWorkspace = ref();
const notificationSettingsOpen = ref(false);

const thumbStyle = {
  borderRadius: '5px',
  backgroundColor: 'var(--primary)',
  width: '5px',
  opacity: 0.75,
};

const barStyle = {
  borderRadius: '9px',
  backgroundColor: 'inherit',
  width: '9px',
  opacity: 0.2,
};

const workspaceMenuItems = (workspace: DtoWorkspace) => {
  return [
    {
      text: 'Уведомления',
      icon: BellIcon,
      btnAttrs: {
        'data-id': 'workspace-settings-button-top',
      },
      onClick: () => {
        selectedWorkspace.value = workspace;
        notificationSettingsOpen.value = !notificationSettingsOpen.value;
      },
    },
    {
      text: 'Настройки',
      icon: SettingsIcon,
      btnAttrs: {
        id: 'workspace-settings-button',
      },
      to: workspace.slug ? `/${workspace.slug}/settings` : undefined,
    },
  ];
};

const handleAddWorkspaceToFavorite = async (workspaceId: string) => {
  await addWorkspaceToFavorite({ workspace: workspaceId });
  await userStore.getUserWorkspaces();
};

const handleRemoveWorkspaceFromFavorites = async (workspaceId: string) => {
  await removeWorkspaceFromFavorites(workspaceId);
  await userStore.getUserWorkspaces();
};
</script>
