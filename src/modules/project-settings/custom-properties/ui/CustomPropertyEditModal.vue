<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card style="min-width: 400px; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? 'Редактировать параметр' : 'Создать параметр' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            class="base-input"
            label="Имя параметра"
            dense
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            class="base-selector"
            label="Тип"
            dense
            emit-value
            map-options
          />

          <div v-if="isSelectType" class="q-mt-md">
            <span class="text-grey-7">Варианты выбора:</span>
            <div class="q-mt-sm">
              <div
                v-for="(_, index) in form.options"
                :key="index"
                class="row items-center q-mb-sm"
              >
                <q-input
                  v-model="form.options![index]"
                  class="base-input col"
                  :label="`Вариант ${index + 1}`"
                  dense
                  :rules="[(val) => !!val?.trim() || 'Поле не может быть пустым']"
                  lazy-rules
                />
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  size="sm"
                  class="q-ml-sm"
                  @click="removeOption(index)"
                  :disable="form.options?.length <= 0"
                />
              </div>
              <q-btn
                flat
                dense
                no-caps
                icon="add"
                label="Добавить вариант"
                color="primary"
                @click="addOption"
              />
            </div>
          </div>

          <div>
            <span class="text-grey-7">Видимость:</span>
            <div class="row q-mt-sm">
              <q-radio
                v-model="form.only_admin"
                :val="false"
                label="Все пользователи"
                dense
                class="q-mr-md"
              />
              <q-radio
                v-model="form.only_admin"
                :val="true"
                label="Только администраторы"
                dense
              />
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
              :label="isEdit ? 'Сохранить' : 'Создать'"
              :disable="!canSubmit"
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
//cores
import { ref, watch, computed } from 'vue';

//api
import { PropertyTemplate } from '../services/api';

const props = defineProps<{
  modelValue: boolean;
  editItem?: PropertyTemplate | null;
}>();

const emit = defineEmits(['update:modelValue', 'submit']);

//variables
const form = ref<PropertyTemplate>({
  name: '',
  type: 'string',
  only_admin: true,
  options: [],
});

const isEdit = computed(() => !!props.editItem);
const isSelectType = computed(() => form.value.type === 'select');
const hasEmptyOptions = computed(() => {
  if (!isSelectType) return false;
  if (isSelectType && form.value.options.length <= 0) return true;
  return form.value.options?.some((opt: string) => !opt || opt.trim() === '') ?? false;
});
const canSubmit = computed(() => {
  if (!form.value.name) return false;
  if (isSelectType.value && hasEmptyOptions.value) return false;
  return true;
});

//consts
const typeOptions = [
  { label: 'Строка', value: 'string' },
  { label: 'Флаг', value: 'boolean' },
  { label: 'Список', value: 'select' },
];

//methods
const onSubmit = () => {
  const data = { ...form.value };
  if (data.type !== 'select') {
    delete data.options;
  }
  emit('submit', data);
};

const addOption = () => {
  if (!form.value.options) {
    form.value.options = [];
  }
  form.value.options.push('');
};

const removeOption = (index: number) => {
  form.value.options?.splice(index, 1);
};

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.editItem) {
        form.value = { 
          ...props.editItem,
          options: props.editItem.options || [],
        };
      } else {
        form.value = {
          name: '',
          type: 'string',
          only_admin: true,
          options: [],
        };
      }
    }
  },
);

watch(
  () => form.value.type,
  (newType) => {
    if (newType === 'select' && (!form.value.options || form.value.options.length === 0)) {
      form.value.options = [''];
    }
  },
);
</script>
