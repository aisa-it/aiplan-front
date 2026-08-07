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
            :items="PROJECT_EMOJI_OPTIONS"
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
import { useRoute } from 'vue-router';
import ConfirmCloseProjectCreateDialog from './ConfirmCloseProjectCreateDialog.vue';
// @ts-ignore
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import {
  NETWORK_CHOICES,
  PROJECT_IDENTIFIER_LENGTH,
} from '@/constants/constants';
import { PROJECT_EMOJI_OPTIONS, PROJECT_EMOJIS } from '@/constants/emojis';
import { getRandomEmoji } from '@/utils/helpers';

const projectsApi = new (withInterceptors(Projects))();
const cyrillicToTranslit = CyrillicToTranslit();

const route = useRoute();
const workspaceStore = useWorkspaceStore();

const isOpen = defineModel<boolean>();

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
  emoji_and_icon: PROJECT_EMOJI_OPTIONS[0],
  cover_image: '',
});

const clear = () => {
  projectValues.value = {
    name: '',
    identifier: '',
    description: '',
    public: NETWORK_CHOICES[0],
    emoji_and_icon: PROJECT_EMOJI_OPTIONS[0],
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
  isValidIdentifier.value = val.trim().length >= PROJECT_IDENTIFIER_LENGTH.MIN;
  return (
    val.trim().length >= PROJECT_IDENTIFIER_LENGTH.MIN ||
    `Идентификатор должен содержать ${PROJECT_IDENTIFIER_LENGTH.MIN} и более символов`
  );
};

const createIdentifier = () => {
  if (projectValues.value.name) {
    projectValues.value.identifier = cyrillicToTranslit
      .transform(projectValues.value.name.replace(/ /g, '').substring(0, 3))
      .toUpperCase();
  }
};

const createNewProject = async () => {
  const workspaceSlug = route.params.workspace as string;
  if (!workspaceSlug) return;

  const payload = {
    cover_image: '/images/vercel.jpeg',
    description: projectValues.value.description || '',
    emoji:
      projectValues.value.emoji_and_icon?.value ||
      getRandomEmoji(PROJECT_EMOJIS),
    identifier: projectValues.value.identifier,
    name: projectValues.value.name,
    public: projectValues.value.public.value,
  };

  try {
    await projectsApi.createProject(workspaceSlug, payload);
    await workspaceStore.getWorkspaceProjects(workspaceSlug);
    isOpen.value = false;
    clear();
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
  }
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
