import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'

export type SidebarSectionId = 'projects' | 'sprints'
type StoredSectionId = SidebarSectionId | 'forms'
type SectionLayout = { weights: Record<string, unknown>; open: Record<string, unknown> }

const defaultOrder: StoredSectionId[] = ['projects', 'sprints', 'forms']
const layoutKey = 'menuItemsLayout'

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Storage can be unavailable. */ }
}

export function useSidebarPreferences(workspaceSlug: Ref<string | null>) {
  const mini = ref(readJson('isMiniState', true) === true)
  const savedWidth = Number(readJson('menuSidebarWidth', 300))
  const width = ref(Number.isFinite(savedWidth) ? Math.max(300, savedWidth) : 300)
  const rawLayout = readJson<Partial<SectionLayout> | null>(layoutKey, null)
  const storedLayout: SectionLayout = {
    weights: rawLayout?.weights && typeof rawLayout.weights === 'object' ? rawLayout.weights : {},
    open: rawLayout?.open && typeof rawLayout.open === 'object' ? rawLayout.open : {},
  }
  const open = ref<Record<SidebarSectionId, boolean>>({
    projects: validBoolean(storedLayout.open.project, true),
    sprints: validBoolean(storedLayout.open.sprints, true),
  })
  const weights = ref<Record<SidebarSectionId, number>>({
    projects: validWeight(storedLayout.weights.project),
    sprints: validWeight(storedLayout.weights.sprints),
  })
  const helpOpen = ref(validBoolean(storedLayout.open.help, false))
  const order = ref<StoredSectionId[]>([...defaultOrder])

  watch(mini, value => saveJson('isMiniState', value))
  let widthSaveTimer: ReturnType<typeof setTimeout> | null = null
  watch(width, value => {
    if (widthSaveTimer !== null) clearTimeout(widthSaveTimer)
    widthSaveTimer = setTimeout(() => {
      saveJson('menuSidebarWidth', Math.round(value))
      widthSaveTimer = null
    }, 150)
  })
  onBeforeUnmount(() => {
    if (widthSaveTimer === null) return
    clearTimeout(widthSaveTimer)
    saveJson('menuSidebarWidth', Math.round(width.value))
  })
  const saveLayout = () => {
    saveJson(layoutKey, {
      weights: { ...storedLayout.weights, project: weights.value.projects, sprints: weights.value.sprints },
      open: { ...storedLayout.open, project: open.value.projects, sprints: open.value.sprints, help: helpOpen.value },
    })
  }
  let layoutSaveTimer: ReturnType<typeof setTimeout> | null = null
  watch([open, weights, helpOpen], () => {
    if (layoutSaveTimer !== null) clearTimeout(layoutSaveTimer)
    layoutSaveTimer = setTimeout(() => {
      saveLayout()
      layoutSaveTimer = null
    }, 150)
  }, { deep: true })
  onBeforeUnmount(() => {
    if (layoutSaveTimer === null) return
    clearTimeout(layoutSaveTimer)
    saveLayout()
  })

  watch(workspaceSlug, slug => {
    if (!slug) { order.value = [...defaultOrder]; return }
    const stored = readJson<unknown>(`${slug}_menu`, defaultOrder)
    const valid = Array.isArray(stored)
      ? stored.filter((id): id is StoredSectionId => defaultOrder.includes(id) && typeof id === 'string')
      : []
    order.value = [...new Set([...valid, ...defaultOrder])]
  }, { immediate: true })

  const sections = computed(() => order.value.filter((id): id is SidebarSectionId => id !== 'forms'))

  function setVisibleOrder(ids: SidebarSectionId[]) {
    const visible = new Set(ids)
    const currentVisible = order.value.filter((id): id is SidebarSectionId => visible.has(id as SidebarSectionId))
    if (ids.length !== currentVisible.length || new Set(ids).size !== ids.length) return
    let index = 0
    const next = order.value.map(id => visible.has(id as SidebarSectionId) ? ids[index++] : id)
    order.value = next
    if (workspaceSlug.value) saveJson(`${workspaceSlug.value}_menu`, next)
  }

  return { mini, width, open, weights, helpOpen, sections, setVisibleOrder }
}

function validWeight(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1
}

function validBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}
