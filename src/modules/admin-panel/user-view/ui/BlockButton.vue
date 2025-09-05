<template>
  <q-btn flat dense>
    <BlockIconColored v-if="active" />
    <UnblockIconColored v-else />
    <HintTooltip>{{ active ? 'Заблокировать' : 'Разблокировать' }}</HintTooltip>
  </q-btn>
</template>

<script setup lang="ts">
import BlockIconColored from 'src/components/icons/BlockIconColored.vue';
import UnblockIconColored from 'src/components/icons/UnblockIconColored.vue';
defineProps<{ active: boolean }>();
</script>
