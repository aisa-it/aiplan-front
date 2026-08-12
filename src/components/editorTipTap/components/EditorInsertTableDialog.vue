<template>
  <div>
    <div class="d-flex flex-column">
      <v-text-field
        v-model.number="table.cols"
        type="number"
        variant="outlined"
        density="compact"
        hide-details="auto"
        :min="1"
        :max="100"
        label="Число столбцов"
        class="base-input mb-2"
        :rules="[validateCols]"
      />
      <v-text-field
        v-model.number="table.rows"
        type="number"
        variant="outlined"
        density="compact"
        hide-details="auto"
        :min="1"
        :max="100"
        label="Число строк"
        class="base-input"
        :rules="[validateRows]"
      />
    </div>
    <div class="d-flex flex-nowrap mt-3 ga-2">
      <v-btn
        variant="text"
        density="compact"
        class="btn flex-1-1-0"
        @click="$emit('cancel')"
      >
        Отмена
      </v-btn>
      <v-btn
        variant="text"
        density="compact"
        class="btn flex-1-1-0"
        :disabled="!validateForm"
        @click="handlePasteTable"
      >
        Вставить
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { computed, ref } from 'vue';

const emits = defineEmits<{
  pasteTable: [{ rows: number; cols: number }];
  cancel: [];
}>();

// vars
const table = ref({
  rows: 2,
  cols: 2,
});

//function
const handlePasteTable = () => {
  emits('pasteTable', table.value);
};

const validateCols = (value: number) => {
  if (!value || Number(value) < 1 || Number(value) > 100) {
    return 'Число столбцов от 1 до 100';
  }
  return true;
};

const validateRows = (value: number) => {
  if (value < 1 || value > 100) {
    return 'Число строк от 1 до 100';
  }
  return true;
};

const validateForm = computed(() => {
  const isValidCols = validateCols(table.value.cols) === true;
  const isValidRows = validateRows(table.value.rows) === true;
  return isValidCols && isValidRows;
});
</script>

<style lang="scss" scoped>
:deep(.btn) {
  min-height: fit-content;
  padding: 4px;
  font-weight: 500;
  font-size: 16px;
}

:deep(.base-input) {
  .v-field {
    border-radius: 8px;
  }
}
</style>
