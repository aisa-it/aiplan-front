<template>
  <q-item-section class="no-wrap">
    <div class="row q-mb-xs gap-x-4 items-center">
      <span>
        {{ isOptionsInSelect ? 'Вариант' : 'Вопрос' }} {{ number }}
        {{ typeLabel }}</span
      >
      <slot name="toggle"></slot>
    </div>
    <div class="no-wrap row justify-between flex-center">
      <div class="row no-wrap full-w">
        <q-input
          v-model.trim="computedValue"
          dense
          :label="`Введите ${isOptionsInSelect ? 'вариант' : 'вопрос'}`"
          class="base-input full-w q-mr-sm q-pb-sm"
          lazy-rules
          :rules="[(val: string) => isEmpty(val, 'вопрос')]"
        />
        <q-btn
          flat
          no-caps
          size="16px"
          class="delete-btn-only-icon q-mb-sm"
          @click.stop="emits('deleteQuestion')"
        >
          <BinIcon color="#fff" />
        </q-btn>
      </div>
      <div
        v-if="showArrow"
        class="justify-end no-wrap q-ml-sm"
        :class="!$q.screen.lt.sm ? 'row' : 'column'"
      >
        <q-btn
          flat
          no-caps
          class="btn-only-icon-sm bordered"
          :class="!$q.screen.lt.sm ? 'q-mr-xs' : 'q-mb-xs'"
          @click.stop="emits('upper')"
        >
          <ArrowDown class="rotate-180" />
        </q-btn>
        <q-btn
          flat
          no-caps
          class="btn-only-icon-sm bordered"
          @click.stop="emits('lower')"
        >
          <ArrowDown />
        </q-btn>
      </div>
    </div>
    <slot name="dependency-config"></slot>
    <slot name="nested"></slot>
    <slot name="buttonAdd"></slot>
  </q-item-section>
</template>

<script setup lang="ts">
//core
import { computed } from 'vue';
import { useQuasar } from 'quasar';

//constants
import { QUESTION_TYPE_FIELD_OPTIONS } from 'src/constants/constants';

//icons
import BinIcon from 'src/components/icons/BinIcon.vue';
import ArrowDown from 'src/components/icons/ArrowDown.vue';

//utils
import { isEmpty } from 'src/utils/validation';

const props = defineProps<{
  modelValue: string;
  number: number;
  showArrow: boolean;
  type?: string;
  isOptionsInSelect?: boolean;
}>();

const emits = defineEmits<{
  'update:model-value': [value: string];
  deleteQuestion: [];
  upper: [];
  lower: [];
}>();

//core
const $q = useQuasar();

//computed
const computedValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:model-value', val),
});

const typeLabel = computed(() => {
  const option = QUESTION_TYPE_FIELD_OPTIONS.find(
    (item) => item.type === props.type,
  );
  return option?.label ? `(${option?.label})` : '';
});
</script>
