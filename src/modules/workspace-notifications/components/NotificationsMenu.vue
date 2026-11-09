<template>
  <v-card class="flex h-full w-full flex-col overflow-hidden">
    <div class="flex items-center px-6 pt-6 pb-4">
      <h5 class="m-0 text-xl font-medium">
        {{ t('workspaceNotifications.title') }}
      </h5>

      <v-spacer />

      <v-btn
        v-if="canCreate"
        :aria-label="t('workspaceNotifications.create')"
        class="normal-case"
        color="primary"
        :icon="isMobile"
        variant="outlined"
        @click="$emit('create')"
      >
        <AddIcon />
        <span v-if="!isMobile" class="ml-1">{{
          t('workspaceNotifications.create')
        }}</span>
      </v-btn>
    </div>

    <div
      v-if="isLoading && !hasNotifications"
      class="grid min-h-65 flex-1 place-items-center"
    >
      <DefaultLoader />
    </div>

    <div
      v-else-if="!hasNotifications"
      class="grid min-h-65 flex-1 place-items-center px-6 text-secondary"
    >
      <span>{{ t('workspaceNotifications.notFound') }}</span>
    </div>

    <div v-else class="min-h-0 flex-1">
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AddIcon from '@/components/icons/AddIcon.vue';
import DefaultLoader from '@/components/loaders/DefaultLoader.vue';

const { t } = useI18n();

defineProps<{
  canCreate?: boolean;
  hasNotifications: boolean;
  isLoading: boolean;
  isMobile?: boolean;
}>();

defineEmits<{
  create: [];
}>();
</script>
