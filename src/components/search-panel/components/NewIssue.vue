<template>
  <v-btn
    color="primary"
    variant="flat"
    :ripple="false"
    class="!h-8 !min-h-8 !min-w-0 !rounded-lg !px-2 !py-0 !text-sm !font-medium !normal-case"
  >
    <AddIcon />
    <span class="leading-none">Создать</span>
  </v-btn>
</template>

<script setup lang="ts">
import AddIcon from '@/components/icons/AddIcon.vue'
</script>
