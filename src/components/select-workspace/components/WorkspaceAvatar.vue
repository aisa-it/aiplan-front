<template>
  <v-avatar color="primary" variant="tonal" size="32" rounded="lg" class="text-xs">
    {{ letter }}
  </v-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
}>()

const letter = computed(() => props.name?.trim()?.[0]?.toUpperCase() || 'А')
</script>
