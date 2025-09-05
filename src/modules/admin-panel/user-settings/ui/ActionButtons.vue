<template>
  <div class="row justify-end" style="width: 100%; text-align: right; gap: 8px">
    <div class="col-12 col-md-auto">
      <q-btn
        no-caps
        class="full-width secondary-btn"
        :class="isActive ? 'secondary-negative-btn' : 'secondary-positive-btn'"
        style="min-width: 160px"
        @click="
          () => {
            $emit('block');
          }
        "
      >
        {{ isActive ? 'Заблокировать' : 'Разблокировать' }}
      </q-btn>
    </div>
    <div class="col-12 col-md-auto">
      <q-btn
        @click="$emit('save')"
        no-caps
        class="full-width secondary-btn"
        style="min-width: 160px"
      >
        Сохранить
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isActive: boolean;
}>();

defineEmits<{ block: []; save: [] }>();
</script>
