<template>
  <div>
    <div class="flex column">
      <q-input
        v-model.number="table.cols"
        type="number"
        filled
        :min="1"
        :max="100"
        label="Число столбцов"
        class="base-input full-width bg-[transparent] hide-btn-input-number"
        lazy-rules
        :rules="[validateCols]"
      />
      <q-input
        v-model.number="table.rows"
        type="number"
        filled
        :min="1"
        :max="100"
        label="Число строк"
        class="base-input full-width bg-[transparent] hide-btn-input-number"
        lazy-rules
        :rules="[validateRows]"
      />
    </div>
    <div class="flex no-wrap">
      <q-btn
        flat
        dense
        no-caps
        class="btn color-primary q-mr-sm full-w"
        label="Отмена"
        @click="$emit('cancel')"
      />
      <q-btn
        flat
        dense
        no-caps
        class="btn color-primary full-w"
        label="Вставить"
        v-close-popup
        :disable="!validateForm"
        @click="handlePasteTable"
      />
    </div>
  </div>
</template>

<script lang="ts">
// core
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'EditInsertTableDialog',
  emits: ['pasteTable', 'cancel'],
  setup(props, { emit }) {
    // vars
    const table = ref({
      rows: 2,
      cols: 2,
    });

    //function
    const handlePasteTable = () => {
      emit('pasteTable', table.value);
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

    const handleHide = () => {
      table.value = {
        rows: 2,
        cols: 2,
      };
    };

    return {
      table,
      handleHide,
      validateCols,
      validateRows,
      validateForm,
      handlePasteTable,
    };
  },
});
</script>

<style lang="scss" scoped>
:deep(.btn) {
  min-height: fit-content;
  padding: 4px;
  font-weight: 500;
  font-size: 16px;
}

:deep(.q-input) {
  .q-field__control {
    width: 240px;
    height: 40px;
    border: 1px solid $dark-gray !important;
    border-radius: 8px;
    background: transparent;

    &:after,
    &:before {
      display: none !important;
    }

    .q-field__native {
      padding-top: 16px;
    }

    .q-field__label {
      top: 8px;
    }

    .q-field__marginal {
      height: fit-content;
      margin: auto 0;
    }
  }

  .q-field__bottom {
    padding-top: 2px;
    min-height: 16px;
  }
}
</style>
