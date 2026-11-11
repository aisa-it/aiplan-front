<template>
  <v-navigation-drawer
    v-if="!isAiDocRoute"
    :model-value="!isNarrow || mobileOpen"
    :permanent="!isNarrow"
    :temporary="isNarrow"
    :rail="!isNarrow && mini"
    :rail-width="56"
    :width="isNarrow ? 300 : sidebarWidth"
    color="background"
    class="main-sidebar"
    @update:model-value="emit('update:mobileOpen', $event)"
    @mouseenter="showToggle = true"
    @mouseleave="showToggle = false"
  >
    <div class="sidebar-shell" :class="{ 'sidebar-shell--compact': compact }" data-tour="sidebar">
      <div ref="sidebarMain" class="sidebar-main">
        <RouterLink
          v-if="workspaceSlug"
          class="sidebar-home"
          :class="{ 'sidebar-active': route.name === 'general-workspace' }"
          :to="{ name: 'general-workspace', params: { workspace: workspaceSlug } }"
          :title="compact ? t('sidebar.home') : undefined"
          @click="closeMobile"
        >
          <HomeIcon :color="route.name === 'general-workspace' ? 'rgb(var(--v-theme-primary))' : 'currentColor'" />
          <span v-if="!compact">{{ t('sidebar.home') }}</span>
        </RouterLink>

        <template v-for="(section, index) in visibleSections" :key="section">
          <v-menu v-if="compact" v-model="popupOpen[section]" location="end" :offset="8" :close-on-content-click="false">
            <template #activator="{ props: menuProps }">
              <button v-bind="menuProps" class="sidebar-rail-item" :class="{ 'sidebar-active': isActive(section) }" :title="t(`sidebar.${section}`)" :aria-label="t(`sidebar.${section}`)">
                <component :is="sectionIcon(section)" :color="isActive(section) ? 'rgb(var(--v-theme-primary))' : 'currentColor'" />
              </button>
            </template>
            <div class="sidebar-popup"><SidebarSectionList :section="section" compact @navigate="onNavigate" /></div>
          </v-menu>

          <section
            v-else
            :data-sidebar-section="section"
            class="sidebar-section"
            :class="{ 'sidebar-section--open': open[section] }"
            :style="{ flexGrow: open[section] ? weights[section] : 0 }"
          >
            <div
              v-if="index > 0 && open[section] && open[visibleSections[index - 1]]"
              class="sidebar-height-handle"
              @pointerdown.stop="startHeightResize($event, section, visibleSections[index - 1])"
            />
            <div
              class="sidebar-section-header"
              :class="{ 'sidebar-active': isActive(section) }"
              role="button"
              tabindex="0"
              :aria-expanded="open[section]"
              @click="toggleSection($event, section)"
              @keydown.enter.prevent="toggleSection($event, section)"
              @keydown.space.prevent="toggleSection($event, section)"
            >
              <component :is="sectionIcon(section)" :color="isActive(section) ? 'rgb(var(--v-theme-primary))' : 'currentColor'" />
              <span class="sidebar-section-title">{{ t(`sidebar.${section}`) }}</span>
              <v-menu v-if="section === 'projects' && canCreateProject" location="end">
                <template #activator="{ props: menuProps }">
                  <v-btn v-bind="menuProps" color="text" icon size="x-small" variant="text" :aria-label="t('sidebar.createProject')" @pointerdown.stop @click.stop><AddIcon :width="18" :height="18" /></v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item :title="t('sidebar.createProject')" />
                  <v-list-item :title="t('sidebar.importJira')" />
                </v-list>
              </v-menu>
              <v-menu v-if="section === 'sprints'" location="end">
                <template #activator="{ props: menuProps }">
                  <v-btn v-bind="menuProps" color="text" icon size="x-small" variant="text" :aria-label="t('sidebar.notificationSettings')" @pointerdown.stop @click.stop><span class="material-symbols-rounded sidebar-action-icon">more_horiz</span></v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item v-if="canCreateSprint" :title="t('sidebar.createSprint')" />
                  <v-list-item :title="t('sidebar.notificationSettings')" />
                </v-list>
              </v-menu>
              <span class="material-symbols-rounded sidebar-chevron" :class="{ 'sidebar-chevron--open': open[section] }">expand_more</span>
            </div>
            <div v-if="open[section]" class="sidebar-section-content">
              <SidebarSectionList :section="section" @navigate="onNavigate" />
            </div>
          </section>
        </template>
      </div>

      <div v-if="compact" class="sidebar-help-rail">
        <v-menu location="end" :offset="8">
          <template #activator="{ props: menuProps }">
            <button v-bind="menuProps" class="sidebar-rail-item" :title="t('sidebar.help')" :aria-label="t('sidebar.help')"><HelpIcon color="currentColor" /></button>
          </template>
          <div class="sidebar-help-popup"><div class="sidebar-help-title">{{ t('sidebar.help') }}</div><HelpItems compact /></div>
        </v-menu>
      </div>
      <div v-else class="sidebar-help">
        <button class="sidebar-help-header" @click="helpOpen = !helpOpen">
          <HelpIcon color="currentColor" />
          <span class="sidebar-help-label">{{ t('sidebar.help') }}</span>
          <span class="material-symbols-rounded sidebar-chevron" :class="{ 'sidebar-chevron--open': helpOpen }">expand_more</span>
        </button>
        <HelpItems v-if="helpOpen" />
      </div>
    </div>

    <button
      v-if="!isNarrow && showToggle"
      class="sidebar-toggle"
      :aria-label="mini ? t('sidebar.expandMenu') : t('sidebar.collapseMenu')"
      @click="mini = !mini"
    ><span class="material-symbols-rounded sidebar-toggle-icon">{{ mini ? 'chevron_right' : 'chevron_left' }}</span></button>
    <div v-if="!isNarrow && !mini" class="sidebar-width-handle" @pointerdown="startWidthResize" />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import MenuProjectsIcon from '@/components/icons/MenuProjectsIcon.vue'
import SprintIcon from '@/components/icons/SprintIcon.vue'
import HelpIcon from '@/components/icons/HelpIcon.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUserStore } from '@/stores/user-store'
import { useUtilsStore } from '@/stores/utils-store'
import { checkPermissionByWs } from '@/utils/permissions'
import SidebarSectionList from './SidebarSectionList.vue'
import HelpItems from './SidebarHelpItems.vue'
import { useSidebarPreferences, type SidebarSectionId } from './useSidebarPreferences'

const props = defineProps<{ mobileOpen: boolean }>()
const emit = defineEmits<{ 'update:mobileOpen': [value: boolean] }>()
const { t } = useI18n()
const route = useRoute()
const { width: viewportWidth } = useDisplay()
const isNarrow = computed(() => viewportWidth.value < 1024)
const compact = computed(() => !isNarrow.value && mini.value)
const isAiDocRoute = computed(() => route.path.includes('/aidoc'))
const workspaceStore = useWorkspaceStore()
const { currentWorkspaceSlug } = storeToRefs(workspaceStore)
const { workspaceRoleName } = storeToRefs(useUserStore())
const workspaceSlug = computed(() => currentWorkspaceSlug.value)
const { mini, width: sidebarWidth, open: storedOpen, weights, helpOpen: savedHelpOpen, sections, setVisibleOrder } = useSidebarPreferences(workspaceSlug)
const mobileSectionOpen = ref<Record<SidebarSectionId, boolean>>({ projects: true, sprints: true })
const open = computed(() => isNarrow.value ? mobileSectionOpen.value : storedOpen.value)
const mobileHelpOpen = ref(false)
const helpOpen = computed({ get: () => isNarrow.value ? mobileHelpOpen.value : savedHelpOpen.value, set: value => { if (isNarrow.value) mobileHelpOpen.value = value; else savedHelpOpen.value = value } })
const visibleSections = computed(() => sections.value.filter(id => id !== 'sprints' || checkPermissionByWs(workspaceRoleName.value, 'show-sprints-nav')))
const canCreateProject = computed(() => checkPermissionByWs(workspaceRoleName.value, 'create-project'))
const canCreateSprint = computed(() => checkPermissionByWs(workspaceRoleName.value, 'create-sprint'))
const showToggle = ref(false)
const popupOpen = ref<Record<SidebarSectionId, boolean>>({ projects: false, sprints: false })
const utilsStore = useUtilsStore()
if (!utilsStore.version) void utilsStore.getVersion()
const sidebarMain = ref<HTMLElement | null>(null)
const ignoreNextClick = ref(false)
let sortable: Sortable | null = null
let activeResizeCleanup: (() => void) | null = null

watch(() => route.fullPath, onNavigate)
watch(currentWorkspaceSlug, slug => {
  if (slug) void workspaceStore.getWorkspaceSummary(slug).catch(error => console.error('Failed to load sidebar data', error))
}, { immediate: true })
watch(viewportWidth, value => {
  if (value >= 1024) sidebarWidth.value = Math.min(sidebarWidth.value, Math.max(300, value / 2))
})
watch([compact, isAiDocRoute], async () => {
  await nextTick()
  sortable?.destroy()
  sortable = null
  if (compact.value || isAiDocRoute.value || !sidebarMain.value) return
  sortable = Sortable.create(sidebarMain.value, {
    draggable: '.sidebar-section',
    handle: '.sidebar-section-header',
    filter: 'button, a, .sidebar-height-handle',
    preventOnFilter: false,
    animation: 150,
    ghostClass: 'sidebar-sort-ghost',
    chosenClass: 'sidebar-sort-chosen',
    fallbackClass: 'sidebar-sort-fallback',
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 5,
    delay: 300,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    onStart: () => { ignoreNextClick.value = true },
    onEnd: event => {
      const item = event.item as HTMLElement
      const ids = Array.from(event.to.children)
        .map(el => (el as HTMLElement).dataset.sidebarSection)
        .filter((id): id is SidebarSectionId => id === 'projects' || id === 'sprints')

      // Sortable moves the DOM node. Restore it before Vue applies the reactive order.
      item.remove()
      event.from.insertBefore(item, event.from.children[event.oldIndex ?? 0] ?? null)
      setVisibleOrder(ids)
      window.setTimeout(() => { ignoreNextClick.value = false }, 200)
    },
  })
}, { immediate: true, flush: 'post' })

function closeMobile() { if (isNarrow.value && props.mobileOpen) emit('update:mobileOpen', false) }
function onNavigate() { popupOpen.value.projects = false; popupOpen.value.sprints = false; closeMobile() }
function sectionIcon(id: SidebarSectionId) { return id === 'projects' ? MenuProjectsIcon : SprintIcon }
function isActive(id: SidebarSectionId) { return id === 'projects' ? route.path.includes('/projects/') : route.path.includes('/sprints/') }
function toggleSection(event: Event, id: SidebarSectionId) {
  if (ignoreNextClick.value) { event.preventDefault(); ignoreNextClick.value = false; return }
  if (isNarrow.value && !open.value[id]) {
    for (const other of visibleSections.value) open.value[other] = false
  }
  open.value[id] = !open.value[id]
}
function startWidthResize(event: PointerEvent) {
  event.preventDefault()
  activeResizeCleanup?.()
  const startX = event.clientX
  const startWidth = sidebarWidth.value
  const move = (next: PointerEvent) => { sidebarWidth.value = Math.max(300, Math.min(viewportWidth.value / 2, Math.round(startWidth + next.clientX - startX))) }
  const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); activeResizeCleanup = null }
  activeResizeCleanup = end
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end, { once: true })
  window.addEventListener('pointercancel', end, { once: true })
}
function startHeightResize(event: PointerEvent, current: SidebarSectionId, previous: SidebarSectionId) {
  event.preventDefault()
  activeResizeCleanup?.()
  const section = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-sidebar-section]')
  const previousSection = section?.previousElementSibling as HTMLElement | null
  if (!section || !previousSection) return
  const startY = event.clientY
  const currentHeight = section.getBoundingClientRect().height
  const previousHeight = previousSection.getBoundingClientRect().height
  const totalWeight = weights.value[current] + weights.value[previous]
  const move = (next: PointerEvent) => {
    const delta = Math.max(300 - previousHeight, Math.min(currentHeight - 300, next.clientY - startY))
    weights.value[previous] = Math.max(.01, totalWeight * (previousHeight + delta) / (currentHeight + previousHeight))
    weights.value[current] = Math.max(.01, totalWeight - weights.value[previous])
  }
  const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); activeResizeCleanup = null }
  activeResizeCleanup = end
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end, { once: true })
  window.addEventListener('pointercancel', end, { once: true })
}
onBeforeUnmount(() => { sortable?.destroy(); activeResizeCleanup?.() })
</script>

<style scoped>
.main-sidebar { border-right: 1px solid rgb(var(--v-theme-border)); color: rgb(var(--v-theme-text)) !important; overflow: visible; }
.main-sidebar :deep(.v-navigation-drawer__content) { overflow: visible; }
.sidebar-shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.sidebar-main { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow-y: auto; }
.sidebar-home, .sidebar-rail-item { display: flex; flex: none; align-items: center; width: 100%; height: 40px; gap: 16px; padding: 0 16px; color: inherit; text-decoration: none; text-align: left; }
.sidebar-home:hover, .sidebar-rail-item:hover, .sidebar-section-header:hover, .sidebar-help-header:hover { background: rgba(var(--v-theme-primary), .08); }
.sidebar-active { background: rgba(var(--v-theme-primary), .08); }
.sidebar-section { display: flex; position: relative; flex-direction: column; flex-shrink: 0; min-height: 40px; border-bottom: 1px solid rgb(var(--v-theme-border)); }
.sidebar-section--open { flex: 1 0 0; min-height: 300px; }
.sidebar-section-header { display: flex; align-items: center; gap: 16px; height: 40px; min-height: 40px; padding: 0 12px 0 16px; cursor: pointer; user-select: none; }
.sidebar-section-title { flex: 1; }
.sidebar-chevron { transition: transform .2s; }
.sidebar-chevron, .sidebar-action-icon { font-size: 16px; }
.sidebar-toggle-icon { font-size: 20px; }
.sidebar-chevron--open { transform: rotate(180deg); }
.sidebar-section-content { flex: 1; min-height: 0; overflow: hidden; }
.sidebar-height-handle { position: absolute; top: -3px; left: 0; right: 0; height: 6px; z-index: 2; cursor: row-resize; touch-action: none; }
.sidebar-help { margin-top: auto; flex: none; border-top: 1px solid rgb(var(--v-theme-border)); }
.sidebar-help-header { display: flex; align-items: center; width: 100%; height: 40px; gap: 16px; padding: 0 16px; text-align: left; }
.sidebar-help-label { flex: 1; min-width: 0; white-space: nowrap; }
.sidebar-help-header > svg, .sidebar-help-header > .sidebar-chevron { flex: none; }
.sidebar-shell--compact .sidebar-home, .sidebar-shell--compact .sidebar-rail-item { justify-content: center; padding: 0; height: 48px; }
.sidebar-help-rail { margin-top: auto; }
.sidebar-popup { width: 300px; height: min(70vh, 520px); color: rgb(var(--v-theme-text)); background: rgb(var(--v-theme-surface)); box-shadow: 0 2px 10px #0003; }
.sidebar-help-popup { width: 230px; color: rgb(var(--v-theme-text)); background: rgb(var(--v-theme-surface)); box-shadow: 0 2px 10px #0003; }
.sidebar-help-title { padding: 12px 16px; font-weight: 600; }
.sidebar-toggle { position: absolute; top: 15px; right: -10px; z-index: 5; width: 24px; height: 24px; border-radius: 50%; background: rgb(var(--v-theme-surface)); box-shadow: 0 1px 5px #0004; }
.sidebar-width-handle { position: absolute; top: 0; right: 0; bottom: 0; width: 6px; cursor: col-resize; touch-action: none; }
@media (max-width: 1023px) { .sidebar-section--open { min-height: 0; flex-grow: 0 !important; } .sidebar-section-content { max-height: min(50vh, 420px); overflow: auto; } .sidebar-main { overflow-y: auto; } }
</style>

<style>
.sidebar-sort-ghost { opacity: .5; border-top: 2px solid rgb(var(--v-theme-primary)); }
.sidebar-sort-chosen { cursor: grabbing; }
.sidebar-sort-fallback { opacity: .9; background: rgb(var(--v-theme-surface)); box-shadow: 0 4px 12px #0003; }
</style>
