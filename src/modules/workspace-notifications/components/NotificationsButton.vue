<template>
  <v-badge
    :model-value="showBadge && count > 0"
    :content="count"
    color="error"
    floating
    location="top right"
    offset-x="15"
    offset-y="10"
  >
    <v-btn
      v-bind="$attrs"
      aria-label="Уведомления"
      icon
      variant="text"
      :ripple="false"
      class="header-icon-btn"
    >
      <BellIcon />
    </v-btn>
  </v-badge>
</template>

<script setup lang="ts">
import BellIcon from '@/components/icons/BellIcon.vue';

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    count?: number;
    showBadge?: boolean;
  }>(),
  {
    count: 0,
    showBadge: true,
  },
);
</script>
