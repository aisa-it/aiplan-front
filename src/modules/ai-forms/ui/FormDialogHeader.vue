<template>
  <div class="row justify-between flex-column q-mb-md">
    <h5 class="q-ma-none">
      {{ title ? `Редактирование формы ${title}` : 'Создать форму' }}
    </h5>
    <q-btn
      v-if="!$q.screen.lt.sm"
      flat
      dense
      rounded
      icon="close"
      @click="emits('close')"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

defineProps<{ title?: string }>();
const emits = defineEmits<{ close: [] }>();

const $q = useQuasar();
</script>
