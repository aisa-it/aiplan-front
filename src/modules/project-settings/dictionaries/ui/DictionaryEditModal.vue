<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <q-card style="width: min(400px, 95vw); border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? 'Переименовать справочник' : 'Создать справочник' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="name"
            class="base-input"
            label="Название справочника"
            dense
            autofocus
            :rules="[(val) => !!val?.trim() || 'Введите название']"
            lazy-rules
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
              :label="isEdit ? 'Сохранить' : 'Создать'"
              :disable="!name?.trim()"
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
import { Dictionary } from '../services/api';

const props = defineProps<{
  modelValue: boolean;
  editItem?: Dictionary | null;
}>();

const emits = defineEmits<{ submit: [data: { name: string }]; 'update:modelValue': [boolean] }>();

//variables
const name = ref('');

const isEdit = computed(() => !!props.editItem);

//methods
const onSubmit = () => {
  emits('submit', { name: name.value.trim() });
};

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      name.value = props.editItem?.name || '';
    }
  },
);
</script>
