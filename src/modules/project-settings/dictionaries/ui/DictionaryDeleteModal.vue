<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Удалить справочник?</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        Справочник «{{ itemName }}» будет удален вместе со всеми строками.
        Это действие необратимо.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Отмена"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
          no-caps
        />
        <q-btn
          flat
          label="Удалить"
          class="delete-btn"
          style="width: 100px"
          @click="$emit('confirm')"
          v-close-popup
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  itemName?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();
</script>
