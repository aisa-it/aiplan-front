<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <q-card style="width: min(450px, 95vw); border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? 'Редактировать строку' : 'Добавить строку' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.value"
            class="base-input"
            label="Значение"
            dense
            autofocus
            :rules="[(val) => !!val?.trim() || 'Введите значение']"
            lazy-rules
          />

          <q-input
            v-model="form.attrsText"
            class="base-textarea"
            label="Атрибуты (JSON)"
            dense
            autogrow
            type="textarea"
            :error="attrsError !== ''"
            :error-message="attrsError"
            hint='Формат: {"ключ": "значение"}'
          />

          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn
              flat
              dense
              no-caps
              class="secondary-btn"
              style="width: 110px"
              label="Отмена"
              v-close-popup
            />
            <q-btn
              :label="isEdit ? 'Сохранить' : 'Добавить'"
              :disable="!form.value?.trim()"
              flat
              dense
              no-caps
              class="primary-btn"
              style="width: 110px"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//core
import { ref, watch, computed } from 'vue';

//api
import { DictionaryRow } from '../services/api';

const props = defineProps<{
  modelValue: boolean;
  editItem?: DictionaryRow | null;
}>();

const emits = defineEmits<{
  submit: [data: { value: string; attrs?: Record<string, any> }];
  'update:modelValue': [boolean];
}>();

//variables
const form = ref<{ value: string; attrsText: string }>({
  value: '',
  attrsText: '',
});
const attrsError = ref('');

const isEdit = computed(() => !!props.editItem);

//methods
const onSubmit = () => {
  attrsError.value = '';
  let attrs: Record<string, any> = {};

  const text = form.value.attrsText.trim();
  if (text !== '') {
    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        attrsError.value = 'Атрибуты должны быть JSON-объектом';
        return;
      }
      attrs = parsed;
    } catch {
      attrsError.value = 'Некорректный JSON';
      return;
    }
  }

  emits('submit', { value: form.value.value.trim(), attrs });
};

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      attrsError.value = '';
      form.value = {
        value: props.editItem?.value || '',
        attrsText: props.editItem?.attrs
          ? JSON.stringify(props.editItem.attrs, null, 2)
          : '',
      };
    }
  },
);
</script>
