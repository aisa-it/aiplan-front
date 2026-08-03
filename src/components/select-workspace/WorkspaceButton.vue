<template>
  <v-btn icon variant="text" rounded="lg" :ripple="false" class="workspace-btn ml-3">
    <WorkspaceAvatar :name="currentWorkspace?.name" />

    <v-menu activator="parent" location="bottom start" :offset="4" :close-on-content-click="false">
      <v-list min-width="280" rounded="lg" class="py-1">
        <v-list-item>
          <template #title>
            <span class="text-sm text-text">Пространства</span>
          </template>
          <template #append>
            <AddIcon :width="24" :height="24" class="text-icon" />
          </template>
        </v-list-item>

        <v-list-item v-if="isLoading">
          <div class="flex w-full justify-center py-2">
            <DefaultLoader :size="32" :width="4" />
          </div>
        </v-list-item>

        <v-list-item
          v-for="item in workspaces"
          :key="item.id"
          :active="item.slug === workspaceSlug"
          color="primary"
          rounded="lg"
          @click="goToWorkspace(item.slug)"
        >
          <template #prepend>
            <WorkspaceAvatar :name="item.name" />
          </template>

          <v-list-item-title
            class="abbreviated-text min-w-0 max-w-[150px] text-[14px]"
            :class="item.slug === workspaceSlug ? 'text-primary' : 'text-text'"
          >
            {{ item.name }}
          </v-list-item-title>

          <template #append>
            <v-btn
              icon
              variant="text"
              rounded="sm"
              :ripple="false"
              class="workspace-action-btn"
              @mousedown.stop
              @click.stop="toggleFavorite(item.id)"
            >
              <StarIcon
                :width="16"
                :height="16"
                :filled="!!item.is_favorite"
                :color="item.is_favorite ? '#F2994A' : '#474a52'"
              />
            </v-btn>

            <v-menu location="end" :offset="4" open-on-click :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon
                  variant="text"
                  rounded="sm"
                  :ripple="false"
                  class="workspace-action-btn"
                  @mousedown.stop
                >
                  <v-icon size="16" color="#474a52">mdi-dots-horizontal</v-icon>
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
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AddIcon from '@/components/icons/AddIcon.vue'
import BellIcon from '@/components/icons/BellIcon.vue'
import SettingsIcon from '@/components/icons/SettingsIcon.vue'
import StarIcon from '@/components/icons/StarIcon.vue'
import DefaultLoader from '@/components/loaders/DefaultLoader.vue'
import WorkspaceAvatar from './components/WorkspaceAvatar.vue'
import { useWorkspacesStore } from '@/stores/workspaces-store'

const route = useRoute()
const router = useRouter()
const workspacesStore = useWorkspacesStore()
const { workspaces, workspace, isLoading } = storeToRefs(workspacesStore)
const { toggleFavorite } = workspacesStore

const workspaceSlug = computed(() => (route.params.workspace as string) || '')

const currentWorkspace = computed(
  () =>
    workspace.value ??
    workspaces.value.find((item) => item.slug === workspaceSlug.value) ??
    null,
)

watch(
  workspaceSlug,
  (slug) => {
    if (slug) workspacesStore.fetchWorkspace(slug)
  },
  { immediate: true },
)

const goToWorkspace = (slug?: string) => {
  if (!slug) return
  router.push(`/${slug}`)
}
</script>
