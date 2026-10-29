<template>
  <v-btn color="primary" variant="flat" :ripple="false" class="new-issue-btn">
    <AddIcon />
    <span class="leading-none">{{ t('common.actions.create') }}</span>
  </v-btn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AddIcon from '@/components/icons/AddIcon.vue'

const { t } = useI18n();
</script>
