<template>
  <ActionMenu :items="items" plain>
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="{ ...$attrs, ...menuProps }"
        color="text"
        icon
        size="x-small"
        variant="text"
        :aria-label="t('projects.createProject')"
        @pointerdown.stop
        @click.stop
        @keydown.enter.stop
        @keydown.space.stop
      >
        <PlusIcon />
      </v-btn>
    </template>
  </ActionMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ActionMenu from '@/components/menus/ActionMenu.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';

defineOptions({ inheritAttrs: false });
const emit = defineEmits<{ create: [] }>();
const { t } = useI18n();

const items = computed(() => [
  { label: t('projects.createProject'), onClick: () => emit('create') },
  { label: t('projects.createForm') },
  { label: t('projects.importJira') },
]);
</script>
