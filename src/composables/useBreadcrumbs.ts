import { createSharedComposable } from '@vueuse/core'
import { readonly, ref } from 'vue'

export type BreadcrumbItem = {
  title: string
  to?: string
  icon?: 'home'
}

const useBreadcrumbsInternal = () => {
  const items = ref<BreadcrumbItem[]>([])

  const setBreadcrumbs = (next: BreadcrumbItem[]) => {
    items.value = next
  }

  const addBreadcrumb = (item: BreadcrumbItem) => {
    items.value = [...items.value, item]
  }

  const removeBreadcrumb = () => {
    if (!items.value.length) return
    items.value = items.value.slice(0, -1)
  }

  const reset = () => {
    items.value = []
  }

  return {
    items: readonly(items),
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    reset,
  }
}

export const useBreadcrumbs = createSharedComposable(useBreadcrumbsInternal)
