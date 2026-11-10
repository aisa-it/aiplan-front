import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  DtoWorkspace,
  DtoWorkspaceWithCount,
} from '@aisa-it/aiplan-api-ts/src/data-contracts'
import { WorkspaceService } from '@/services/workspace.service'

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<DtoWorkspaceWithCount[]>([])
  const workspace = ref<DtoWorkspace | null>(null)
  const isLoading = ref(false)

  const getUserWorkspaces = async () => {
    isLoading.value = true
    try {
      workspaces.value = await WorkspaceService.getUserWorkspaces()
    } finally {
      isLoading.value = false
    }
  }

  const getWorkspace = async (slug: string) => {
    if (!slug) return
    workspace.value = await WorkspaceService.getWorkspace(slug)
  }

  const toggleFavorite = async (workspaceId?: string) => {
    if (!workspaceId) return

    const item = workspaces.value.find((w) => w.id === workspaceId)
    if (!item) return

    if (item.is_favorite) {
      await WorkspaceService.removeFromFavorites(workspaceId)
    } else {
      await WorkspaceService.addToFavorites(workspaceId)
    }

    workspaces.value = await WorkspaceService.getUserWorkspaces()
  }

  return {
    workspaces,
    workspace,
    isLoading,
    getUserWorkspaces,
    getWorkspace,
    toggleFavorite,
  }
})
