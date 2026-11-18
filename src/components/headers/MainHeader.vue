<template>
  <v-app-bar flat border="b" height="50" color="background">
    <v-btn
      v-if="isNarrow"
      icon
      variant="text"
      class="ml-2"
      :aria-label="t('sidebar.openMenu')"
      @click="emit('toggle-menu')"
    ><MenuIcon /></v-btn>
    <WorkspaceButton />
    <AppBreadcrumbs />
    <template #append>
      <SearchPanel />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import AppBreadcrumbs from '@/components/headers/AppBreadcrumbs.vue'
import SearchPanel from '@/components/search-panel/SearchPanel.vue'
import WorkspaceButton from '@/components/select-workspace/WorkspaceButton.vue'
import MenuIcon from '@/components/icons/MenuIcon.vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{ 'toggle-menu': [] }>()
const { t } = useI18n()
const { width } = useDisplay()
const isNarrow = computed(() => width.value < 1024)
</script>
