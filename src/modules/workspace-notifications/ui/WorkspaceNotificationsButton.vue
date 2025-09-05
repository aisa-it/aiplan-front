<template>
  <q-btn flat dense class="btn-only-icon-sm bordered">
    <BellIcon />
    <q-badge v-if="count && isShow" color="red" floating rounded>
      {{ count }}
    </q-badge>
    <slot/>
  </q-btn>
</template>

<script setup lang="ts">
// icons
import BellIcon from 'src/components/icons/BellIcon.vue';

defineProps<{
  count: number;
  isShow?: boolean;
}>();
</script>
