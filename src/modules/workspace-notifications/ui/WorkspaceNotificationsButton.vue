<template>
  <q-btn flat dense class="btn-only-icon-sm" data-tour="notifications" :class="isMobile ? 'q-mr-sm' : 'bordered'" >
    <BellIcon />
    <q-badge v-if="count && isShow" color="red" floating rounded>
      {{ count }}
    </q-badge>
    <slot />
  </q-btn>
</template>

<script setup lang="ts">
import { toRef } from 'vue';

// icons
import BellIcon from 'src/components/icons/BellIcon.vue';

const props = defineProps<{
  count: number;
  isShow?: boolean;
  isMobile?: boolean;
}>();

const isMobile = toRef(props.isMobile);
</script>
