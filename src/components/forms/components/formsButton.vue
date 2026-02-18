<template>
  <q-card-section
    class="q-pb-none q-pr-none q-pl-none"
    :class="$q.screen.lt.sm ? 'column' : 'row justify-end'"
  >
    <q-btn
      no-caps
      class="secondary-btn q-mr-sm"
      :style="{
        width: $q.screen.lt.sm ? '100%' : isEdit ? '170px' : '100px',
        order: $q.screen.lt.sm ? 1 : undefined,
      }"
      label="Отмена"
      @click="emits('close')"
    />
    <q-btn
      no-caps
      class="primary-btn create-btn"
      :style="{ width: $q.screen.lt.sm ? '100%' : isEdit ? '170px' : '100px' }"
      :class="$q.screen.lt.sm ? 'q-mb-sm' : ''"
      :label="isEdit ? 'Редактировать' : 'Создать'"
      :disabled="disable"
      @click="emits('save')"
    />
  </q-card-section>
</template>

<script setup lang="ts">
defineProps<{
  disable: boolean;
  isEdit?: boolean;
}>();

const emits = defineEmits<{
  close: [];
  save: [];
}>();
</script>
