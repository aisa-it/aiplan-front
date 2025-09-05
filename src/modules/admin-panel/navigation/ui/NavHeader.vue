<template>
  <q-item-label header style="padding: 7px 16px !important; color: inherit">
    <div class="row items-center justify-between">
      <span class="body-text-md">{{ title }}</span>
      <q-btn flat :to="url">
        <HomeIcon />
        <HintTooltip>На главную</HintTooltip>
      </q-btn>
    </div>
  </q-item-label>
</template>

<script setup lang="ts">
import HomeIcon from 'src/components/icons/HomeIcon.vue';
defineProps<{
  title: string;
  url: string;
}>();
</script>
