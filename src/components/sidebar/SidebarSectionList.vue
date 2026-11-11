<template>
  <div class="sidebar-list">
    <template v-if="section === 'projects'">
      <div v-if="compact" class="sidebar-list-title">
        <span>{{ t('sidebar.projects') }}</span>
        <v-menu v-if="canCreateProject" location="end">
          <template #activator="{ props: menuProps }">
            <v-btn v-bind="menuProps" color="text" icon size="x-small" variant="text" :aria-label="t('sidebar.createProject')"><AddIcon :width="18" :height="18" /></v-btn>
          </template>
          <v-list density="compact">
            <v-list-item :title="t('sidebar.createProject')" />
            <v-list-item :title="t('sidebar.importJira')" />
          </v-list>
        </v-menu>
      </div>
      <div class="sidebar-list-scroll">
        <div v-for="project in projects" :key="project.id" class="sidebar-project-row" :class="{ 'sidebar-row-active': route.params.project === project.identifier }">
          <RouterLink
            v-if="project.identifier && workspaceSlug && canAccessProject(project)"
            class="sidebar-project-link"
            :to="{ name: 'project', params: { workspace: workspaceSlug, project: project.identifier } }"
            @click="emit('navigate')"
          >
            <v-avatar v-if="project.logo" size="22" rounded="sm"><v-img :src="getUrlFile(project.logo)" /></v-avatar>
            <span v-else-if="project.emoji" class="sidebar-project-mark">{{ projectEmoji(project.emoji) }}</span>
            <v-avatar v-else size="22" rounded="sm" color="primary" variant="tonal">{{ project.name?.[0]?.toUpperCase() }}</v-avatar>
            <span class="sidebar-project-name" :title="project.name">{{ project.name }}</span>
            <span v-if="compact" class="sidebar-project-identifier">({{ project.identifier }})</span>
          </RouterLink>
          <div v-else class="sidebar-project-link"><span class="sidebar-project-name">{{ project.name }}</span></div>
          <v-btn
            v-if="project.id && canAccessProject(project)"
            class="sidebar-row-action"
            :class="{ 'sidebar-favorite-inactive': !project.is_favorite }"
            color="text"
            icon
            size="x-small"
            variant="text"
            :aria-label="project.is_favorite ? t('sidebar.removeFavorite') : t('sidebar.addFavorite')"
            :loading="favoritePending === project.id"
            @click.stop="toggleFavorite(project)"
          >
            <StarIcon :width="16" :height="16" :filled="project.is_favorite" :color="project.is_favorite ? '#F2994A' : 'rgb(var(--v-theme-text))'" />
          </v-btn>
          <v-menu v-if="canAccessProject(project)">
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" class="sidebar-row-action" color="text" icon size="x-small" variant="text" :aria-label="t('sidebar.projectSettings')" @click.stop><span class="material-symbols-rounded sidebar-more-icon">more_horiz</span></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item v-if="canManageProject(project)" :title="t('sidebar.projectSettings')" />
              <v-list-item :title="t('sidebar.taskNotifications')" />
              <v-list-item v-if="project.current_user_membership?.role === 15" :title="t('sidebar.projectNotifications')" />
              <v-list-item :title="t('sidebar.copyLink')" @click="copyProjectLink(project)" />
            </v-list>
          </v-menu>
        </div>
      </div>
      <div v-if="compact" class="sidebar-list-footer">{{ t('sidebar.allProjects') }}</div>
    </template>

    <template v-else>
      <div v-if="compact" class="sidebar-list-title">{{ t('sidebar.sprints') }}</div>
      <div class="sidebar-list-scroll">
        <div v-for="sprint in sprints" :key="sprint.id" class="sidebar-sprint-row">
          <SidebarSprintProgress :stats="sprint.stats ?? {}" />
          <span class="sidebar-project-name" :title="sprint.name">{{ sprint.name }}</span>
          <span v-if="sprint.start_date && sprint.end_date" class="sidebar-sprint-dates">{{ sprintDates(sprint.start_date, sprint.end_date) }}</span>
          <v-menu v-if="!compact">
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" class="sidebar-row-action" color="text" icon size="x-small" variant="text" :aria-label="t('sidebar.projectSettings')"><span class="material-symbols-rounded sidebar-more-icon">more_horiz</span></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item :title="t('sidebar.projectSettings')" />
              <v-list-item :title="t('sidebar.copyLink')" />
              <v-list-item :title="t('sidebar.deleteSprint')" />
            </v-list>
          </v-menu>
        </div>
      </div>
      <div v-if="compact" class="sidebar-list-footer">{{ t('sidebar.allSprints') }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { DtoProjectLight, DtoSprintFolder, DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts'
import StarIcon from '@/components/icons/StarIcon.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import SidebarSprintProgress from './SidebarSprintProgress.vue'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUserStore } from '@/stores/user-store'
import { checkPermissionByWs } from '@/utils/permissions'
import { getUrlFile } from '@/utils/helpers'
import { toast } from '@/modules/toast'

defineProps<{ section: 'projects' | 'sprints'; compact?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()
const { t, locale } = useI18n()
const route = useRoute()
const workspaceStore = useWorkspaceStore()
const { currentWorkspaceSlug, workspaceProjects, workspaceSummary } = storeToRefs(workspaceStore)
const { workspaceRoleName } = storeToRefs(useUserStore())
const workspaceSlug = computed(() => currentWorkspaceSlug.value)
const canCreateProject = computed(() => checkPermissionByWs(workspaceRoleName.value, 'create-project'))
const projects = computed(() => [...workspaceProjects.value].sort((a, b) => Number(!!b.is_favorite) - Number(!!a.is_favorite)))
const sprints = computed<DtoSprintLight[]>(() => {
  const entries = (workspaceSummary.value?.sprints ?? []) as Array<DtoSprintFolder | DtoSprintLight>
  return entries.flatMap(entry =>
    Array.isArray((entry as DtoSprintFolder).sprints)
      ? (entry as DtoSprintFolder).sprints ?? []
      : [entry as DtoSprintLight],
  )
})
const favoritePending = ref<string | null>(null)

function canAccessProject(project: DtoProjectLight) {
  return !!project.current_user_membership || ['owner', 'admin'].includes(workspaceRoleName.value)
}

function canManageProject(project: DtoProjectLight) {
  return ['owner', 'admin'].includes(workspaceRoleName.value) || (project.current_user_membership?.role ?? 0) >= 10
}

async function copyProjectLink(project: DtoProjectLight) {
  if (!workspaceSlug.value || !project.identifier) return
  await navigator.clipboard.writeText(`${location.origin}/${workspaceSlug.value}/projects/${project.identifier}`)
}

function projectEmoji(value: string) {
  const code = Number.parseInt(value, 10)
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : value
}

function sprintDates(start: string, end: string) {
  const language = locale.value === 'en' ? 'en-US' : 'ru-RU'
  return `${new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(new Date(start))} — ${new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(new Date(end))}`
}

async function toggleFavorite(project: DtoProjectLight) {
  if (!project.id || favoritePending.value) return
  favoritePending.value = project.id
  try {
    await workspaceStore.toggleProjectFavorite(project)
    toast.success(t(project.is_favorite ? 'sidebar.favoriteRemoved' : 'sidebar.favoriteAdded'))
  } catch (error) {
    console.error('Failed to update project favorite', error)
    toast.error(t(project.is_favorite ? 'sidebar.favoriteRemoveError' : 'sidebar.favoriteAddError'))
  } finally {
    favoritePending.value = null
  }
}
</script>

<style scoped>
.sidebar-list { display: flex; flex-direction: column; min-height: 0; height: 100%; }
.sidebar-list-title { display: flex; align-items: center; justify-content: space-between; min-height: 40px; padding: 5px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
.sidebar-list-scroll { min-height: 0; overflow-y: auto; flex: 1; }
.sidebar-project-row, .sidebar-sprint-row { display: flex; align-items: center; min-height: 38px; padding: 2px 8px 2px 16px; gap: 8px; }
.sidebar-project-row:hover, .sidebar-sprint-row:hover, .sidebar-row-active { background: rgba(var(--v-theme-primary), .08); }
.sidebar-project-link { display: flex; align-items: center; flex: 1; min-width: 0; gap: 8px; color: inherit; text-decoration: none; }
.sidebar-project-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.sidebar-project-mark { width: 22px; text-align: center; flex: none; }
.sidebar-project-identifier, .sidebar-sprint-dates { color: rgb(var(--v-theme-text)); opacity: .65; font-size: 11px; white-space: nowrap; }
.sidebar-row-action { flex: none; }
.sidebar-favorite-inactive { opacity: 0; }
.sidebar-project-row:hover .sidebar-favorite-inactive, .sidebar-favorite-inactive:focus-visible { opacity: 1; }
.sidebar-list-footer { border-top: 1px solid rgb(var(--v-theme-border)); padding: 10px 16px; color: rgb(var(--v-theme-primary)); }
.sidebar-more-icon { font-size: 18px; }
@media (max-width: 768px) { .sidebar-favorite-inactive { opacity: 1; } }
</style>
