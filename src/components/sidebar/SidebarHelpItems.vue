<template>
  <div class="sidebar-help-items">
    <button class="sidebar-help-item"><BookIcon />{{ t(compact ? 'sidebar.shortGuide' : 'sidebar.userGuide') }}</button>
    <button class="sidebar-help-item"><EditIcon />{{ t('sidebar.leaveFeedback') }}</button>
    <a class="sidebar-help-item" href="https://t.me/aiplan_faq" target="_blank" rel="noopener noreferrer"><ChatIcon />{{ t(compact ? 'sidebar.shortSupport' : 'sidebar.contactSupport') }}</a>
    <v-divider />
    <button class="sidebar-help-item sidebar-help-version">{{ t('sidebar.version') }} <AiplanVersion /></button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AiplanVersion from '@/components/AiplanVersion.vue'
import BookIcon from '@/components/icons/BookIcon.vue'
import EditIcon from '@/components/icons/EditIcon.vue'
import ChatIcon from '@/components/icons/ChatIcon.vue'
defineProps<{ compact?: boolean }>()
const { t } = useI18n()
</script>

<style scoped>
.sidebar-help-item { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 40px; padding: 8px 16px; color: inherit; text-decoration: none; text-align: left; }
.sidebar-help-item:hover { background: rgba(var(--v-theme-primary), .08); }
.sidebar-help-version { opacity: .7; font-size: 12px; }
</style>
