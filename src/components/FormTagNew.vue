<template>
  <q-dialog
    class="form-tag-new__container"
    @hide="clearFields"
    @before-show="clearFields"
    ref="myModal"
  >
    <q-card class="inner-modal-card">
      <q-card-section style="flex: 1">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            class="base-input"
            dense
            v-model="color"
            :rules="['anyColor']"
          >
            <template v-slot:prepend
              ><q-badge rounded :style="{ backgroundColor: color }"
            /></template>
            <template v-slot:append>
              <ColorPicker
                :current-color="color"
                @set-color="(value) => (color = value)"
              />
            </template>
          </q-input>
          <q-input
            style="flex: 1"
            dense
            class="base-input"
            v-model="name"
            label="Название тега"
            lazy-rules
            :rules="[
              (val) => !!val || 'Введите название тега',
              (val) =>
                val.trim() !== '' || 'Тег не может состоять только из пробелов',
              (val) => val.length < 300 || 'Слишком длинное имя',
            ]"
            :error="showError"
            :error-message="errorMessage"
          />
          <div class="flex">
            <q-btn class="secondary-btn" style="flex: 1" v-close-popup
              ><CloseIcon color="var(--primary)"
            /></q-btn>
            <q-btn class="primary-btn q-ml-sm" type="submit" style="flex: 1">
              <AddIcon color="#ffffff" />
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
//core
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { QDialog } from 'quasar';

//icons
import CloseIcon from './icons/CloseIcon.vue';
import AddIcon from './icons/AddIcon.vue';

//components
import ColorPicker from 'src/modules/project-settings/labels/components/ColorPicker.vue';

//composables
import { usePalette } from 'src/modules/project-settings/labels/composables/usePalette';

//services
import { createProjectLabel } from 'src/modules/project-settings/labels/services/api';

//types
import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  projectId?: string;
  workspaceId?: string;
}>();

const emit = defineEmits<{
  close: [];
  add: [tag: DtoLabelLight];
}>();

//composables
const { getRandomColorFromPalette } = usePalette();

//core
const route = useRoute();

//refs
const name = ref('');
const color = ref(getRandomColorFromPalette());
const isTagExistError = ref(false);
const showError = ref(false);
const myModal = ref<QDialog>();

//computed
const errorMessage = computed(() => {
  if (showError.value) {
    if (isTagExistError.value) {
      return 'Данный тег уже существует в проекте';
    } else if (name.value.length === 0) {
      return 'Введите название';
    }
  }
  return '';
});

//methods
const clearFields = () => {
  name.value = '';
  color.value = getRandomColorFromPalette();
  isTagExistError.value = false;
};

const onSubmit = () => {
  showError.value = false;
  createProjectLabel(
    props.workspaceId ?? (route.params.workspace as string),
    props.projectId ?? (route.params.project as string),
    {
      name: name.value,
      color: color.value,
    },
  )
    .then((d) => {
      emit('add', d);
      name.value = '';
      color.value = '#000000';
      isTagExistError.value = false;
      myModal.value?.hide();
    })
    .catch((error) => {
      if (error.response && error.response.status === 409) {
        isTagExistError.value = true;
        showError.value = true;
      } else {
        console.error('Произошла ошибка при создании тега', error);
      }
    });
};
</script>
<style></style>
