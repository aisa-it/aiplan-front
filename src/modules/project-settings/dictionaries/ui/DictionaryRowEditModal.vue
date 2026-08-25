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

          <div>
            <span class="text-grey-7">Атрибуты:</span>
            <div
              v-for="(attr, index) in form.attrs"
              :key="index"
              class="row items-center q-mt-sm"
            >
              <q-input
                v-model="attr.key"
                class="base-input col q-mr-sm"
                label="Ключ"
                dense
              />
              <q-input
                v-model="attr.value"
                class="base-input col"
                label="Значение"
                dense
              />
              <q-btn
                icon="close"
                flat
                round
                dense
                size="sm"
                class="q-ml-sm"
                @click="removeAttr(index)"
              />
            </div>
            <div v-if="attrsError" class="text-negative text-caption q-mt-xs">
              {{ attrsError }}
            </div>
            <q-btn
              flat
              dense
              no-caps
              icon="add"
              label="Добавить атрибут"
              color="primary"
              class="q-mt-sm"
              @click="addAttr"
            />
            <div class="text-caption text-grey q-mt-xs">
              Несколько значений атрибута — JSON-массивом: ["А", "Б"]
            </div>
          </div>

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

interface AttrPair {
  key: string;
  value: string;
}

const props = defineProps<{
  modelValue: boolean;
  editItem?: DictionaryRow | null;
}>();

const emits = defineEmits<{
  submit: [data: { value: string; attrs?: Record<string, any> }];
  'update:modelValue': [boolean];
}>();

//variables
const form = ref<{ value: string; attrs: AttrPair[] }>({
  value: '',
  attrs: [],
});
const attrsError = ref('');

const isEdit = computed(() => !!props.editItem);

//methods
// значение атрибута в поле ввода: строка — как есть, массив и прочее — JSON'ом
const attrValueToText = (val: unknown): string =>
  typeof val === 'string' ? val : JSON.stringify(val);

// обратное преобразование: текст, похожий на JSON-массив, сохраняем массивом
// (row_filter каскадов матчит и строку, и массив), остальное — строкой
const parseAttrValue = (text: string): unknown => {
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // не массив — сохраняем строкой как есть
    }
  }
  return trimmed;
};

const addAttr = () => {
  form.value.attrs.push({ key: '', value: '' });
};

const removeAttr = (index: number) => {
  form.value.attrs.splice(index, 1);
};

const onSubmit = () => {
  attrsError.value = '';
  const attrs: Record<string, any> = {};

  for (const item of form.value.attrs) {
    const key = item.key.trim();
    if (!key && !item.value.trim()) continue;
    if (!key) {
      attrsError.value = 'У атрибута не заполнен ключ';
      return;
    }
    if (key in attrs) {
      attrsError.value = `Ключ «${key}» повторяется`;
      return;
    }
    attrs[key] = parseAttrValue(item.value);
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
        attrs: Object.entries(props.editItem?.attrs || {}).map(([key, v]) => ({
          key,
          value: attrValueToText(v),
        })),
      };
    }
  },
);
</script>
