<template>
  <q-card-section
    class="q-pb-none q-pr-none q-pl-none"
    :class="$q.screen.lt.sm ? 'column' : 'row justify-end'"
  >
    <q-btn
      no-caps
      class="secondary-btn q-mr-sm"
      :style="$q.screen.lt.sm ? 'order: 1; width: 100%' : 'width: 95px'"
      label="Отмена"
      @click="emits('close')"
    />
    <q-btn
      no-caps
      class="primary-btn create-btn"
      :class="$q.screen.lt.sm ? 'q-mb-sm' : ''"
      :label="isEdit ? 'Редактировать' : 'Создать'"
      :disabled="disable"
      :style="$q.screen.lt.sm ? 'width: 100%' : 'width: 102px'"
      @click="emits('save')"
    />
  </q-card-section>
</template>

<script setup lang="ts">
const props = defineProps<{
  disable: boolean;
  isEdit?: boolean;
}>();

const emits = defineEmits<{
  close: [];
  save: [];
}>();
</script>
