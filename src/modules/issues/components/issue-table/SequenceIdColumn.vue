<template>
  <span class="text-xs whitespace-pre-wrap max-[600px]:wrap-break-word">
    {{ identifier }}-{{ sequenceId }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  identifier?: string;
  sequenceId?: number;
}>();
</script>
