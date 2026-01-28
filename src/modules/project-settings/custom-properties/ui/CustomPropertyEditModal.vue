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
});

const isEdit = computed(() => !!props.editItem);

//consts
const typeOptions = [
  { label: 'Строка', value: 'string' },
  { label: 'Флаг', value: 'boolean' },
];

//methods
const onSubmit = () => {
  emit('submit', { ...form.value });
};

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.editItem) {
        form.value = { ...props.editItem };
      } else {
        form.value = {
          name: '',
          type: 'string',
          only_admin: true,
        };
      }
    }
  },
);
</script>
