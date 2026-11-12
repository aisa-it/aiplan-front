<template>
  <div v-if="compact" class="sidebar-help-rail">
    <v-menu location="end" :offset="8">
      <template #activator="{ props: menuProps }">
        <button
          v-bind="menuProps"
          class="sidebar-rail-item"
          :title="t('sidebar.help')"
          :aria-label="t('sidebar.help')"
        >
          <HelpIcon color="currentColor" />
        </button>
      </template>
      <div class="sidebar-help-popup"><HelpItems compact /></div>
    </v-menu>
  </div>
  <div v-else class="sidebar-help">
    <button class="sidebar-help-header" @click="emit('update:open', !open)">
      <HelpIcon color="currentColor" />
      <span class="sidebar-help-label">{{ t('sidebar.help') }}</span>
      <span
        class="material-symbols-rounded sidebar-chevron"
        :class="{ 'sidebar-chevron--open': open }"
      >expand_more</span>
    </button>
    <div class="sidebar-help-content" :class="{ 'sidebar-help-content--open': open }">
      <div class="sidebar-help-content-inner"><HelpItems /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import HelpIcon from '@/components/icons/HelpIcon.vue';
import HelpItems from './SidebarHelpItems.vue';

defineProps<{ compact: boolean; open: boolean }>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();
const { t } = useI18n();
</script>

<style scoped src="../styles/SidebarHelp.css"></style>
