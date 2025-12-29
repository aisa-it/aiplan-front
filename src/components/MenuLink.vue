<template>
  <div
    class="row menu-link"
    :style="'width: 100%; display: flex; justify-content: space-between; align-items: center;'"
  >
    <q-item
      class="menu-link__item row items-center"
      tag="a"
      target="_self"
      :active="
        route.params.project === identifier || route.params.project === id
      "
      :to="hasPermissionByProject(project, 'show-project') ? link : ''"
    >
      <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
      </q-item-section>

      <q-item-section v-else-if="logo" avatar>
        <q-img
          :src="getUrlFile(logo)"
          :style="`width: 20px; height: 20px; border-radius: 4px; color: white;`"
        />
      </q-item-section>

      <q-item-section v-else-if="emoji" avatar>
        {{ String.fromCodePoint(parseInt(emoji?.value ?? emoji)) }}
      </q-item-section>

      <q-item-section v-else avatar>
        <AvatarImage
          :text="title[0].toUpperCase()"
          :tooltip="title"
          :rounded="false"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label class="abbriviated-text">{{ title }}</q-item-label>
        <HintTooltip
          anchor="bottom start"
          self="bottom start"
          :offset="[0, 42]"
        >
          {{ title }}</HintTooltip
        >
      </q-item-section>
      <q-space />

      <MutedIcon
        v-if="isMutedProject(id)"
        :width="16"
        :height="16"
        class="q-mr-sm"
      />
      <div style="display: flex; align-items: center">
        <q-btn
          v-if="hasPermissionByProject(project, 'add-to-fav')"
          class="menu-link__btn q-mr-sm"
          :class="{ 'favorite-btn--inactive': !favorite }"
          flat
          :style="'min-height: 18px !important; min-width: 18px; padding: 0'"
          @click.prevent
        >
          <StarIcon
            :width="16"
            :height="16"
            :color="favorite ? '#F2994A' : ''"
            @click="
              () =>
                favorite === true ? removeFromFavorites(id) : addToFavorites(id)
            "
          />
          <HintTooltip v-if="favorite">Убрать из избранного</HintTooltip>
          <HintTooltip v-else>Добавить в избранное</HintTooltip>
        </q-btn>
        <MenuActions
          v-if="project && hasPermissionByProject(project, 'show-project-popup')"
          :items="getProjectMenuItems()"
        />
      </div>
    </q-item>
  </div>
  <NotificationsSettingsDialog
    v-model="isNotificationsSettingsOpen"
    :project="selectedProject"
  />
  <NotificationsAdminProjectSettingsDialog
    v-model="isNotificationsAdminSettingsOpen"
    :project="selectedProject"
  />
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import AvatarImage from './AvatarImage.vue';
import LinkIcon from './icons/LinkIcon.vue';
import UnmutedIcon from './icons/UnmutedIcon.vue';
import MutedIcon from './icons/MutedIcon.vue';

import SettingsIcon from './icons/SettingsIcon.vue';
import NotificationsSettingsDialog from 'src/components/dialogs/NotificationsSettingsDialog.vue';
import NotificationsAdminProjectSettingsDialog from 'src/components/dialogs/NotificationsAdminProjectSettingsDialog.vue';
import MenuActions from './menu/MenuActions.vue';

// constants
import {
  SUCCESS_ADD_TO_FAVORITE,
  SUCCESS_REMOVE_FROM_FAVORITE,
} from 'src/constants/notifications';
import StarIcon from './icons/StarIcon.vue';

import { getUrlFile } from 'src/utils/helpers';

const props = withDefaults(
  defineProps<{
    id: string;
    emoji?: any;
    title: string;
    caption?: string;
    link?: string;
    icon?: string;
    favorite?: boolean;
    project?: any;
    workspaceSlug?: string;
    identifier?: string;
    logo?: string;
  }>(),
  {
    caption: () => '',
    link: () => '#',
    icon: () => '',
    workspaceSlug: () => '',
  },
);

// stores
const userStore = useUserStore();
const { hasPermissionByProject } = useRolesStore();

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
// store to refs
const { currentWorkspaceSlug, workspaceProjects } = storeToRefs(workspaceStore);

const router = useRouter();
const route = useRoute();

const isNotificationsSettingsOpen = ref(false);
const isNotificationsAdminSettingsOpen = ref(false);
const selectedProject = ref();
const isMutedProject = (projectID: string) => {
  let notifications = workspaceProjects.value.find(
    (project) => project.id === projectID,
  )?.current_user_membership?.notification_settings;
  let isMuted = false;

  for (let n in notifications) {
    if (notifications[n] === true) return (isMuted = true);
  }
  return isMuted;
};

// functions

const addToFavorites = async (projectID: string) => {
  await userStore
    .addProjectToFavorites(props.workspaceSlug, { project: projectID })
    .then(() => {
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_ADD_TO_FAVORITE,
      });
      workspaceStore.getWorkspaceProjects(currentWorkspaceSlug.value);
    });
};

const removeFromFavorites = async (projectID: string) => {
  await userStore
    .removeProjectFromFavorites(props.workspaceSlug, projectID)
    .then(() => {
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_REMOVE_FROM_FAVORITE,
      });
      workspaceStore.getWorkspaceProjects(currentWorkspaceSlug.value as string);
    });
};

const getProjectMenuItems = () => {
  const items = [];

  if (hasPermissionByProject(props.project, 'project-settings')) {
    items.push({
      text: 'Настройки',
      icon: SettingsIcon,
      onClick: () => {
        router.push(
          `/${currentWorkspaceSlug.value}/projects/${props.identifier || props.id}/settings`,
        );
      },
    });
  }

  items.push({
    text: 'Уведомления задач',
    icon: UnmutedIcon,
    onClick: () => {
      selectedProject.value = props.project;
      isNotificationsSettingsOpen.value = true;
    },
  });

  if (props.project?.current_user_membership.role === 15) {
    items.push({
      text: 'Уведомления проекта',
      icon: UnmutedIcon,
      onClick: () => {
        selectedProject.value = props.project;
        isNotificationsAdminSettingsOpen.value = true;
      },
    });
  }

  items.push({
    text: 'Скопировать ссылку',
    icon: LinkIcon,
    onClick: () => {
      projectStore.projectLinkToClipboard(props.identifier || props.id);
    },
  });

  return items;
};
</script>
<style lang="scss">
.right-icon {
  align-items: center;
  padding-top: 2px;
}
.menu-link__settings-btn > span.q-btn__content {
  display: flex !important;
  justify-content: flex-start !important;
}
</style>

<style scoped lang="scss">
.q-btn {
  background: none;
}
.favorite-btn--inactive {
  opacity: 0;

  @media (max-width: 768px) {
    opacity: 1;
  }
}
.menu-link:hover .favorite-btn--inactive {
  opacity: 1;
}
</style>
