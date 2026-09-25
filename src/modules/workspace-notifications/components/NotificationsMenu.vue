<template>
  <v-card
    :rounded="isMobile ? 0 : 'lg'"
    class="flex h-full w-full flex-col overflow-hidden"
  >
    <div class="flex items-center px-6 pt-6 pb-4">
      <h5 class="m-0 text-xl font-medium">Уведомления</h5>

      <v-spacer />

      <v-btn
        v-if="isMobile"
        aria-label="Закрыть уведомления"
        icon="mdi-close"
        variant="text"
        :ripple="false"
        @click="$emit('close')"
      />
    </div>

    <div
      v-if="isLoading && !hasNotifications"
      class="grid min-h-[260px] flex-1 place-items-center"
    >
      <DefaultLoader />
    </div>

    <div
      v-else-if="!hasNotifications"
      class="grid min-h-[260px] flex-1 place-items-center px-6 text-secondary"
    >
      <span>Уведомления не найдены</span>
    </div>

    <div v-else class="min-h-0 flex-1">
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import DefaultLoader from '@/components/loaders/DefaultLoader.vue';

defineProps<{
  hasNotifications: boolean;
  isLoading: boolean;
  isMobile?: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>
