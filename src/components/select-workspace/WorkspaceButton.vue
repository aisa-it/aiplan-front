<template>
  <v-btn
    icon
    variant="text"
    rounded="lg"
    :ripple="false"
    class="workspace-btn ml-3"
  >
    <WorkspaceAvatar :name="currentWorkspaceName" />

    <v-menu
      activator="parent"
      location="bottom start"
      :offset="4"
      :close-on-content-click="false"
    >
      <v-list min-width="280" rounded="lg" class="py-1">
        <v-list-item>
          <template #title>
            <span class="text-sm text-text">Пространства</span>
          </template>
          <template #append>
            <AddIcon :width="24" :height="24" class="text-icon" />
          </template>
        </v-list-item>

        <v-list-item
          v-for="workspace in userWorkspaces"
          :key="workspace.id"
          :active="workspace.slug === route.query.workspace"
          color="primary"
          rounded="lg"
          @click="selectWorkspace(workspace.slug)"
        >
          <template #prepend>
            <WorkspaceAvatar :name="workspace.name" />
          </template>

          <v-list-item-title
            class="abbreviated-text min-w-0 max-w-[150px] text-[14px]"
            :class="
              workspace.slug === route.query.workspace
                ? 'text-primary'
                : 'text-text'
            "
          >
            {{ workspace.name }}
          </v-list-item-title>

          <template #append>
            <div class="ml-2 flex items-center" @click.stop>
              <v-btn
                icon
                variant="text"
                size="x-small"
                :ripple="false"
                @click.stop
              >
                <StarIcon
                  :width="16"
                  :height="16"
                  :filled="workspace.is_favorite"
                  :color="workspace.is_favorite ? '#F2994A' : '#474a52'"
                  @click.stop="toggleFavorite(workspace)"
                />
              </v-btn>

              <v-menu
                location="end"
                :offset="4"
                open-on-click
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    icon
                    variant="text"
                    size="x-small"
                    :ripple="false"
                    class="h-5 w-5"
                    @click.stop
                  >
                    <v-icon size="18" color="#474a52"
                      >mdi-dots-horizontal</v-icon
                    >
                  </v-btn>
                </template>

                <v-list min-width="180" rounded="lg" density="compact">
                  <v-list-item>
                    <div class="flex items-center gap-2 text-text">
                      <BellIcon :width="16" :height="16" color="#474a52" />
                      <span class="text-xs font-normal">Уведомления</span>
                    </div>
                  </v-list-item>
                  <v-list-item>
                    <div class="flex items-center gap-2 text-text">
                      <SettingsIcon :width="16" :height="16" color="#474a52" />
                      <span class="text-xs font-normal">Настройки</span>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import AddIcon from '@/components/icons/AddIcon.vue';
import BellIcon from '@/components/icons/BellIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import StarIcon from '@/components/icons/StarIcon.vue';
import WorkspaceAvatar from './components/WorkspaceAvatar.vue';
import type { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const { userWorkspaces } = storeToRefs(userStore);

const workspaceStore = useWorkspaceStore();
const { workspaceName } = storeToRefs(workspaceStore);

const currentWorkspaceName = computed(() => workspaceName.value || '');

onMounted(() => {
  userStore.getUserWorkspaces();
});

const selectWorkspace = (slug?: string) => {
  if (slug) {
    router.push({ query: { ...route.query, workspace: slug } });
  }
};

const toggleFavorite = (workspace: DtoWorkspaceWithCount) => {
  const isFav = workspace.is_favorite;
  if (isFav) {
    userStore.deleteFavoriteWorkspace(workspace.id);
  } else {
    userStore.addFavoriteWorkspace({ workspace: workspace.id });
  }
};
</script>
