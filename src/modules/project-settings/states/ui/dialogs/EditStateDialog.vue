<template>
  <q-dialog ref="myDialog" @hide="resetDialog">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Изменение статуса</h6>
        <q-input
          dense
          class="base-input"
          v-model="form.name"
          label="Введите имя"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Введите название']"
        />
        <q-input
          dense
          v-model="form.description"
          label="Описание"
          class="base-textarea q-mb-md"
          lazy-rules
          type="textarea"
        />
        <q-select
          dense
          class="base-selector q-mb-md"
          v-model="form.group"
          :options="STATES_TYPES"
          map-options
          label="Группа"
        />
        <q-input
          dense
          class="base-input"
          v-model="form.color"
          label="Выберите цвет"
        >
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color v-model="form.color" />
              </q-popup-proxy>
            </q-icon>
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
          v-close-popup
        />
        <q-btn
          no-caps
          unelevated
          label="Изменить"
          class="primary-btn"
          @click="handleSubmit"
          :disable="form.name.length === 0"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// constants
import { STATES_TYPES } from 'src/constants/constants';
import { SUCCESS_EDIT_STATE } from 'src/constants/notifications';

// interfaces
import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// services
import { updateState } from '../../services/api';

const props = defineProps<{
  currentState?: DtoStateLight;
}>();
const emits = defineEmits<{
  error: [value?: string];
  success: [value?: string];
}>();

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const form = ref(
  props.currentState ? JSON.parse(JSON.stringify(props.currentState)) : {},
);
const myDialog = ref(null);

function resetDialog() {
  form.value = JSON.parse(JSON.stringify(props.currentState));
  form.value.group = STATES_TYPES.find(
    (state) => state.value === form.value.group,
  );
}

const onClose = (type: 'error' | 'success', msg?: string) => {
  resetDialog();
  emits(type as keyof typeof emits, msg);
};

const handleSubmit = async () => {
  form.value.group = form.value.group.value;
  await updateState(
    currentWorkspaceSlug.value || '',
    currentProjectID.value,
    form.value.id,
    form.value,
  ).then(() => onClose('success', SUCCESS_EDIT_STATE));
};

watch(
  () => props.currentState,
  (newVal) => {
    form.value = JSON.parse(JSON.stringify(newVal));
    form.value.group = STATES_TYPES.find(
      (state) => state.value === form.value.group,
    );
  },
  { deep: true },
);
</script>
