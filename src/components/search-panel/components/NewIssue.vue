<template>
  <v-btn color="primary" variant="flat" :ripple="false" class="new-issue-btn">
    <AddIcon />
    <span class="leading-none">Создать</span>
  </v-btn>
</template>

<script setup lang="ts">
import AddIcon from '@/components/icons/AddIcon.vue'
</script>
