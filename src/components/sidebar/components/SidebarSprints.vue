<template>
  <div v-if="compact" class="sidebar-list-title">{{ t('sidebar.sprints') }}</div>
  <div class="sidebar-list-scroll">
    <div v-for="sprint in sprints" :key="sprint.id" class="sidebar-sprint-row">
      <RouterLink v-if="workspaceSlug && sprint.id" class="sidebar-sprint-link" :to="sprintPath(sprint.id)" @click="emit('navigate')">
        <SidebarSprintProgress :stats="sprint.stats ?? {}" />
        <span class="sidebar-sprint-label">
          <span class="sidebar-project-name" :title="compact ? sprint.name : sprintLabel(sprint)">{{ compact ? sprint.name : sprintLabel(sprint) }}</span>
          <span v-if="compact && sprint.start_date && sprint.end_date" class="sidebar-sprint-dates">{{ compactSprintDates(sprint.start_date, sprint.end_date) }}</span>
        </span>
      </RouterLink>
      <div v-else class="sidebar-sprint-link">
        <SidebarSprintProgress :stats="sprint.stats ?? {}" />
        <span class="sidebar-sprint-label">
          <span class="sidebar-project-name" :title="compact ? sprint.name : sprintLabel(sprint)">{{ compact ? sprint.name : sprintLabel(sprint) }}</span>
          <span v-if="compact && sprint.start_date && sprint.end_date" class="sidebar-sprint-dates">{{ compactSprintDates(sprint.start_date, sprint.end_date) }}</span>
        </span>
      </div>
      <SidebarContextMenu v-if="!compact && canShowSprintMenu" :items="sprintMenuItems(sprint)">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" class="sidebar-row-action sidebar-more-action" icon size="x-small" variant="text" :aria-label="t('sidebar.projectSettings')" @click.stop><span class="material-symbols-rounded sidebar-more-icon">more_horiz</span></v-btn>
        </template>
      </SidebarContextMenu>
    </div>
  </div>
  <RouterLink v-if="compact && workspaceSlug" class="sidebar-list-footer" :to="`/${workspaceSlug}/sprints`" @click="emit('navigate')">{{ t('sidebar.allSprints') }}</RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { DtoSprintFolder, DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts'
import SettingsIcon from '../icons/SettingsIcon.vue'
import LinkIcon from '../icons/LinkIcon.vue'
import BinIcon from '../icons/BinIcon.vue'
import SidebarContextMenu from './SidebarContextMenu.vue'
import SidebarSprintProgress from './SidebarSprintProgress.vue'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUserStore } from '@/stores/user-store'
import { checkPermissionByWs } from '@/utils/permissions'

defineProps<{ compact?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()
const { t, locale } = useI18n()
const { currentWorkspaceSlug, workspaceSummary } = storeToRefs(useWorkspaceStore())
const { workspaceRoleName } = storeToRefs(useUserStore())
const workspaceSlug = computed(() => currentWorkspaceSlug.value)
const canShowSprintMenu = computed(() => checkPermissionByWs(workspaceRoleName.value, 'show-sprint-popup'))
const sprints = computed<DtoSprintLight[]>(() => {
  const entries = (workspaceSummary.value?.sprints ?? []) as Array<DtoSprintFolder | DtoSprintLight>
  return entries.flatMap(entry =>
    Array.isArray((entry as DtoSprintFolder).sprints)
      ? (entry as DtoSprintFolder).sprints ?? []
      : [entry as DtoSprintLight],
  )
})

function sprintMenuItems(sprint: DtoSprintLight) {
  return [
    { label: t('sidebar.projectSettings'), icon: SettingsIcon },
    { label: t('sidebar.copyLink'), icon: LinkIcon, onClick: () => void copySprintLink(sprint) },
    { label: t('sidebar.deleteSprint'), icon: BinIcon },
  ]
}

function sprintPath(id: string) {
  return `/${workspaceSlug.value}/sprints/${id}`
}

async function copySprintLink(sprint: DtoSprintLight) {
  if (!workspaceSlug.value || !sprint.id) return
  await navigator.clipboard.writeText(`${location.origin}${sprintPath(sprint.id)}`)
}

function sprintLabel(sprint: DtoSprintLight) {
  const dates = sprintDates(sprint.start_date, sprint.end_date)
  return [sprint.name, dates].filter(Boolean).join(' ')
}

function sprintDates(start?: string, end?: string) {
  const from = parseSprintDate(start)
  const to = parseSprintDate(end)
  if (!from || !to) return ''
  return `(${String(from.day).padStart(2, '0')}.${String(from.month + 1).padStart(2, '0')} - ${String(to.day).padStart(2, '0')}.${String(to.month + 1).padStart(2, '0')})`
}

const shortMonthsRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
function parseSprintDate(value?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return null
  return { day, month, date }
}
function compactDate(value: string) {
  const parsed = parseSprintDate(value)
  if (!parsed) return ''
  if (locale.value === 'en') return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(parsed.date)
  return `${parsed.day} ${shortMonthsRu[parsed.month]}`
}
function compactSprintDates(start: string, end: string) {
  const from = compactDate(start)
  const to = compactDate(end)
  return from && to ? `${from} — ${to}` : ''
}
</script>
