<template>
  <v-dialog
    v-model="isOpen"
    max-width="800"
    persistent
    @update:model-value="onDialogUpdate"
  >
    <v-card class="rounded-xl">
      <v-card-text class="flex flex-col pt-6 pb-2">
        <h6 class="text-h6 font-weight-bold mb-6 text-gray-700">
          Создание нового проекта
        </h6>

        <v-text-field
          v-model="projectValues.name"
          label="Введите имя проекта"
          class="mb-2"
          :rules="[validateName]"
          @update:model-value="createIdentifier"
        />

        <div class="flex flex-row gap-4">
          <v-text-field
            v-model="projectValues.identifier"
            label="Введите идентификатор проекта"
            class="flex-grow"
            :rules="[validateIdentifier]"
            :error="isProjectIdentifier"
            :error-messages="errorMessageProjectIdentifier"
            @update:model-value="
              (val) => {
                if (val)
                  projectValues.identifier = val.toString().toUpperCase();
              }
            "
          />

          <v-select
            v-model="projectValues.public"
            :items="NETWORK_CHOICES"
            item-title="label"
            item-value="value"
            return-object
            class="max-w-[150px] flex-none"
          />

          <v-select
            v-model="projectValues.emoji_and_icon"
            :items="emojiOptions"
            item-title="label"
            item-value="value"
            return-object
            class="max-w-[80px] flex-none"
          />
        </div>
      </v-card-text>

      <v-card-actions class="pt-0 pr-6 pb-6 justify-end gap-3">
        <v-btn
          variant="outlined"
          color="primary"
          @click="handleClose"
          class="w-[110px]"
        >
          Отменить
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!isValidName || !isValidIdentifier"
          @click="createNewProject"
          class="w-[110px]"
        >
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ConfirmCloseProjectCreateDialog
    v-model="isConfirmOpen"
    @close="forceClose"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ConfirmCloseProjectCreateDialog from './ConfirmCloseProjectCreateDialog.vue';

const isOpen = defineModel<boolean>();

// --- ЗАГЛУШКИ КОНСТАНТ (т.к. src/constants пока не перенесены) ---
const NETWORK_CHOICES = [
  { value: true, label: 'Публичный' },
  { value: false, label: 'Приватный' },
];

const emojiOptions = [
  { value: '💼', label: '💼' },
  { value: '🚀', label: '🚀' },
  { value: '📝', label: '📝' },
  { value: '⭐', label: '⭐' },
];

// Состояние валидации
const isProjectIdentifier = ref(false);
const errorMessageProjectIdentifier = ref('');
const isValidName = ref(false);
const isValidIdentifier = ref(false);
const isConfirmOpen = ref(false);

const projectValues = ref({
  name: '',
  identifier: '',
  description: '',
  public: NETWORK_CHOICES[0],
  emoji_and_icon: emojiOptions[0],
  cover_image: '',
});

const clear = () => {
  projectValues.value = {
    name: '',
    identifier: '',
    description: '',
    public: NETWORK_CHOICES[0],
    emoji_and_icon: emojiOptions[0],
    cover_image: '',
  };
  isProjectIdentifier.value = false;
  errorMessageProjectIdentifier.value = '';
};

const handleClose = () => {
  if (projectValues.value.name || projectValues.value.identifier) {
    isConfirmOpen.value = true;
  } else {
    forceClose();
  }
};

const forceClose = () => {
  isOpen.value = false;
  isConfirmOpen.value = false;
  clear();
};

const validateName = (val: string) => {
  isValidName.value = val.trim().length > 0;
  return (
    val.trim().length > 0 || 'Название должно содержать 1 или более символов'
  );
};

const validateIdentifier = (val: string) => {
  isValidIdentifier.value = val.trim().length >= 3;
  return (
    val.trim().length >= 3 ||
    'Идентификатор должен содержать 3 и более символов'
  );
};

const createIdentifier = () => {
  if (projectValues.value.name) {
    // Временно упрощенная транслитерация (без CyrillicToTranslit)
    projectValues.value.identifier = projectValues.value.name
      .replace(/ /g, '')
      .substring(0, 3)
      .toUpperCase();
  }
};

const createNewProject = () => {
  // Заглушка вместо вызова projectStore.createProject
  console.log('Создание проекта (заглушка):', projectValues.value);
  isOpen.value = false;
  clear();
};

const onDialogUpdate = (val: boolean) => {
  if (!val) clear();
};

watch(
  () => projectValues.value.identifier,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      isProjectIdentifier.value = false;
      errorMessageProjectIdentifier.value = '';
    }
  },
  { immediate: true },
);
</script>
