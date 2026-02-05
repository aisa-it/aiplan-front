<template>
  <q-dialog ref="myDialog" @hide="clear">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Создание нового статуса</h6>
        <q-input
          dense
          v-model="form.name"
          label="Введите имя"
          class="base-input"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Введите название']"
        />
        <q-input
          dense
          v-model="form.description"
          label="Описание"
          lazy-rules
          class="base-textarea"
          type="textarea"
          :style="'margin-bottom: 16px'"
        />
        <q-select
          dense
          v-model="group"
          :options="STATES_TYPES"
          map-options
          label="Группа"
          class="base-selector q-mb-md"
        />
        <q-input
          dense
          v-model="form.color"
          label="Выберите цвет"
          class="base-input"
        >
          <template v-slot:append>
            <color-picker
              :currentColor="form.color"
              @set-color="(value: string) => (form.color = value)"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          outline
          label="Отменить"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
        />
        <q-btn
          no-caps
          label="Создать"
          class="primary-btn"
          style="width: 100px"
          @click="handleSubmit"
          :disable="form.name.length === 0"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, watch } from 'vue';

// constants
import { SUCCESS_CREATE_STATE } from 'src/constants/notifications';
import { STATES_COLORS, STATES_TYPES } from 'src/constants/constants';

// interfaces
import { ISelect } from 'src/interfaces/ui';

// services
import { createState } from '../../services/api';
import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import ColorPicker from 'src/modules/project-settings/labels/components/ColorPicker.vue';

const props = defineProps<{
  stateType?: ISelect;
}>();

const emits = defineEmits<{
  error: [value?: string];
  success: [value?: string];
}>();

const route = useRoute();

const form = ref({
  name: '',
  color: STATES_COLORS[Math.floor(Math.random() * STATES_COLORS.length)],
  group: props.stateType?.value,
  description: '',
});

const group = ref<ISelect | undefined>(props.stateType);

const onClose = (type: 'error' | 'success', msg?: string) => {
  clear();
  emits(type as keyof typeof emits, msg);
};

const handleSubmit = async () => {
  form.value.group = group.value?.value;
  await createState(
    route.params.workspace as string,
    route.params.project as string,
    form.value as DtoStateLight,
  ).then(() => onClose('success', SUCCESS_CREATE_STATE));
};

watch(
  () => props.stateType,
  (args) => {
    group.value = args;
  },
);

const clear = () => {
  form.value = {
    name: '',
    color: STATES_COLORS[Math.floor(Math.random() * STATES_COLORS.length)],
    group: props.stateType?.value,
    description: '',
  };
};
</script>
