<template>
  <div class="flex items-center justify-center gap-3 max-[41.875rem]:flex-col">
    <img :src="logo" class="w-[11.875rem] overflow-visible" />
    <span
      class="font-medium text-[2.6875rem] max-[30rem]:text-[2.125rem] leading-none tracking-[0.015625rem] text-center align-middle text-[color:var(--conf-text)]"
    >
      {{ t('conference.title') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import logo from '@/assets/logo.svg';

const { t } = useI18n();
</script>
