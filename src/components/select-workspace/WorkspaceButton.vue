<template>
  <v-btn icon variant="text" rounded="lg" :ripple="false" class="workspace-btn ml-3">
    <WorkspaceAvatar :name="currentWorkspaceName" />

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

        <v-list-item
          v-for="workspace in workspaces"
          :key="workspace.id"
          :active="workspace.active"
          color="primary"
          rounded="lg"
        >
          <template #prepend>
            <WorkspaceAvatar :name="workspace.name" />
          </template>

          <v-list-item-title
            class="text-[14px]"
            :class="workspace.active ? 'text-primary' : 'text-text'"
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
                  :filled="workspace.favorite"
                  :color="workspace.favorite ? '#F2994A' : '#474a52'"
                />
              </v-btn>

              <v-menu location="end" :offset="4" open-on-click :close-on-content-click="false">
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
                    <v-icon size="18" color="#474a52">mdi-dots-horizontal</v-icon>
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
import AddIcon from '@/components/icons/AddIcon.vue'
import BellIcon from '@/components/icons/BellIcon.vue'
import SettingsIcon from '@/components/icons/SettingsIcon.vue'
import StarIcon from '@/components/icons/StarIcon.vue'
import WorkspaceAvatar from './components/WorkspaceAvatar.vue'

// currentWorkspaceName и workspaces временные тестовые данные
// TODO: удалить после подключения к API

const currentWorkspaceName = 'testViktor1'

const workspaces = [
  { id: '1', name: 'testViktor1', active: true, favorite: true },
  { id: '2', name: 'New ssss 11', active: false, favorite: false },
  { id: '3', name: 'новое', active: false, favorite: false },
  { id: '4', name: 'тест тест тест', active: false, favorite: false },
]
</script>
