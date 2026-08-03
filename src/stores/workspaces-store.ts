import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  DtoWorkspace,
  DtoWorkspaceWithCount,
} from '@aisa-it/aiplan-api-ts/src/data-contracts'
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace'
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass'

const workspaceApi = new (withInterceptors(Workspace))()

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<DtoWorkspaceWithCount[]>([])
  const workspace = ref<DtoWorkspace | null>(null)
  const isLoading = ref(false)

  const fetchWorkspaces = async () => {
    isLoading.value = true
    try {
      const { data } = await workspaceApi.getUserWorkspaceList()
      workspaces.value = data ?? []
    } finally {
      isLoading.value = false
    }
  }

  const fetchWorkspace = async (slug: string) => {
    if (!slug) return
    const { data } = await workspaceApi.getWorkspace(slug)
    workspace.value = data
  }

  const toggleFavorite = async (workspaceId?: string) => {
    if (!workspaceId) return

    const item = workspaces.value.find((w) => w.id === workspaceId)
    if (!item) return

    if (item.is_favorite) {
      await workspaceApi.removeWorkspaceFromFavorites(workspaceId)
    } else {
      await workspaceApi.addWorkspaceToFavorites({ workspace: workspaceId })
    }

    const { data } = await workspaceApi.getUserWorkspaceList()
    workspaces.value = data ?? []
  }

  return {
    workspaces,
    workspace,
    isLoading,
    fetchWorkspaces,
    fetchWorkspace,
    toggleFavorite,
  }
})
