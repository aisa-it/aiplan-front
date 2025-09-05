<template>
  <q-btn-dropdown
    v-if="!isSelect"
    flat
    text-color="primary"
    class="btn"
    label="Добавить"
    icon="add"
    no-caps
    dropdown-icon="none"
  >
    <q-list
      v-for="({ label, type }, index) in QUESTION_TYPE_FIELD_OPTIONS"
      :key="index"
    >
      <q-item
        v-if="type !== 'multiselect'"
        clickable
        v-close-popup
        @click="addQuestion(type)"
      >
        <q-item-section>
          <q-item-label>{{ label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
  <q-btn
    v-else
    @click="addQuestion('multiSelect')"
    flat
    text-color="primary"
    class="btn"
    label="Добавить"
    icon="add"
    no-caps
    dropdown-icon="none"
  />
</template>

<script lang="ts" setup>
// constants
import { QUESTION_TYPE_FIELD_OPTIONS } from 'src/constants/constants';

// interfaces
import { IFormNewField } from 'src/interfaces/forms';
const props = withDefaults(
  defineProps<{
    isSelect?: boolean;
  }>(),
  {
    isSelect: false,
  },
);
const emits = defineEmits<{
  addField: [objectField: IFormNewField];
  addTypeField: [type: string];
}>();

const addQuestion = (type: string) => {
  const objectField = props.isSelect
    ? ''
    : {
        label: '',
        required: type !== 'checkbox',
        type: type,
        value: null,
      };

  emits('addField', objectField);
  emits('addTypeField', type);
};
</script>

<style scoped></style>
