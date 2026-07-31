<template>
  <router-view v-if="isReady" />
  <div v-else class="flex h-screen items-center justify-center text-text">
    {{ error ?? 'Загрузка' }}
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user-store'
import { useWorkspacesStore } from '@/stores/workspaces-store'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const workspacesStore = useWorkspacesStore()

const isReady = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const user = await userStore.getMe()
    await workspacesStore.fetchWorkspaces()

    const slug = user.last_workspace_slug || workspacesStore.workspaces[0]?.slug
    if (slug && !route.params.workspace) {
      await router.push(`/${slug}`)
    }

    isReady.value = true
  } catch (e) {
    console.error(e)
    error.value = 'Ошибка загрузки'
  }
})
</script>
