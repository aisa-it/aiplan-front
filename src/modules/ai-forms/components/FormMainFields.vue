<template>
  <div class="row gap-x-sm">
    <div class="col-12 col-sm-auto col-sm-grow">
      <q-input
        v-model="localForm.title"
        dense
        label="Название формы"
        class="q-mb-sm base-input project-input"
        :rules="[(val: string) => isEmpty(val, 'заголовок формы')]"
      />
    </div>

    <div class="col-12 col-sm-auto col-sm-grow" style="max-width: 340px">
      <FormsDate
        :model-value="localForm.end_date ?? ''"
        @update:model-value="updateDate"
        @reset="localForm.end_date = ''"
        :rules="validateDate"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import FormsDate from 'src/components/forms/components/formsDate.vue';

import { isEmpty } from 'src/utils/validation';
import { serializationDate } from 'src/components/forms/helper/helperForm';

import type { AiplanReqForm } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  modelValue: AiplanReqForm;
  validateDate: (val: string) => boolean | string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: AiplanReqForm): void;
}>();

const localForm = ref<AiplanReqForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(localForm.value)) {
      localForm.value = { ...newVal };
    }
  },
  { deep: true },
);

watch(
  () => localForm.value,
  (val) => {
    if (JSON.stringify(val) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', val);
    }
  },
  { deep: true },
);

function updateDate(val: string) {
  localForm.value.end_date = serializationDate(val, false);
}
</script>
