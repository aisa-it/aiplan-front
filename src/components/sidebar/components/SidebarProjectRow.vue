<template>
  <div
    class="sidebar-project-row"
    :class="{ 'sidebar-row-active': active }"
    @contextmenu="emit('contextmenu', $event)"
  >
    <RouterLink
      v-if="canOpen && project.identifier && workspaceSlug"
      class="sidebar-project-link"
      :to="{
        name: 'project',
        params: { workspace: workspaceSlug, project: project.identifier },
      }"
      @click="emit('navigate')"
      ><SidebarProjectIdentity :project="project" :compact="compact"
    /></RouterLink>
    <div v-else class="sidebar-project-link">
      <SidebarProjectIdentity :project="project" :compact="compact" />
    </div>
    <v-tooltip
      v-if="!compact && project.id && canFavorite"
      location="bottom"
      :open-delay="0"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          class="sidebar-row-action"
          :class="{ 'sidebar-favorite-inactive': !project.is_favorite }"
          color="text"
          icon
          size="x-small"
          variant="text"
          :aria-label="
            project.is_favorite
              ? t('sidebar.removeFavorite')
              : t('sidebar.addFavorite')
          "
          :loading="favoritePending"
          @click.stop="emit('favorite')"
          ><StarIcon
            :width="16"
            :height="16"
            :filled="project.is_favorite"
            :color="project.is_favorite ? '#F2994A' : 'rgb(var(--v-theme-text))'"
        /></v-btn>
      </template>
      {{ project.is_favorite ? t('sidebar.removeFavorite') : t('sidebar.addFavorite') }}
    </v-tooltip>
    <SidebarContextMenu v-if="!compact && canShowMenu" :items="menuItems">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="sidebar-row-action sidebar-more-action"
          icon
          size="x-small"
          variant="text"
          :aria-label="t('sidebar.projectSettings')"
          @click.stop
          ><span class="material-symbols-rounded sidebar-more-icon"
            >more_horiz</span
          ></v-btn
        >
      </template>
    </SidebarContextMenu>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import StarIcon from '@/components/icons/StarIcon.vue';
import SidebarContextMenu from './SidebarContextMenu.vue';
import SidebarProjectIdentity from './SidebarProjectIdentity.vue';

defineProps<{
  project: DtoProjectLight;
  compact?: boolean;
  workspaceSlug: string | null;
  active: boolean;
  canOpen: boolean;
  canFavorite: boolean;
  canShowMenu: boolean;
  favoritePending: boolean;
  menuItems: { label: string; icon?: Component; onClick?: () => void }[];
}>();
const emit = defineEmits<{
  navigate: [];
  favorite: [];
  contextmenu: [event: MouseEvent];
}>();
const { t } = useI18n();
</script>
