<template>
  <q-dialog @hide="close">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Создание нового тега</h6>
        <q-form @submit.prevent="handleSubmit" ref="formRef">
          <q-input
            dense
            v-model="form.name"
            label="Введите имя"
            lazy-rules
            class="base-input"
            :rules="[
              (val) => !!val || 'Введите название тега',
              (val) =>
                val.trim() !== '' || 'Тег не может состоять только из пробелов',
              (val) => val.length < 300 || 'Слишком длинное имя',
            ]"
          />

          <q-input
            dense
            v-model="form.color"
            label="Выберите цвет"
            class="base-input"
            :rules="[
              (val) =>
                /^#[0-9A-Fa-f]{6}$/.test(val) ||
                'Введите корректный цвет в HEX формате',
            ]"
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
              label="Создать"
              class="primary-btn"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { SUCCESS_CREATE_TAG } from 'src/constants/notifications';
import { DEFAULT_LABEL } from 'src/constants/constants';
import { QForm } from 'quasar';
import { createProjectLabel } from '../../services/api';
import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const emit = defineEmits(['close']);

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const { project } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const formRef = ref<QForm>();
const form = ref<DtoLabelLight>({
  ...DEFAULT_LABEL,
  color: DEFAULT_LABEL.color(),
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (!valid) return;

  await createProjectLabel(
    currentWorkspaceSlug.value as string,
    project.value.id,
    form.value,
  ).then(async () => {
    await projectStore.getProjectLabels(
      currentWorkspaceSlug.value as string,
      project.value.id,
    );
    emit('close');
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_CREATE_TAG,
    });
  });
};

const close = async () => {
  return new Promise<void>((resolve) => {
    form.value = {
      ...DEFAULT_LABEL,
      color: DEFAULT_LABEL.color(),
    };
    resolve();
  });
};
</script>
