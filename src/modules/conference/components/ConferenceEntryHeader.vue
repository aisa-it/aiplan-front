<template>
  <div class="flex items-center justify-center gap-3 max-[670px]:flex-col">
    <img :src="logo" class="w-[190px] overflow-visible" />
    <span
      class="font-medium text-[43px] max-[480px]:text-[34px] leading-none tracking-[0.25px] text-center align-middle"
      :class="isNight ? 'text-[#bac4d5]' : 'text-[#474a52]'"
    >
      Конференция
    </span>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/logo.svg';

defineProps<{
  isNight: boolean;
}>();
</script>
