<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    @update:model-value="onDialogUpdate"
  >
    <v-card class="rounded-xl">
      <v-card-text class="flex flex-col">
        <h6 class="text-h6 font-weight-bold mb-6 text-gray-700">
          Создание рабочего пространства
        </h6>

        <v-text-field
          v-model="workspaceValues.name"
          label="Введите имя пространства"
          class="mb-2"
          :rules="[validateName]"
          @update:model-value="createSlug"
        />

        <v-text-field
          v-model="workspaceValues.slug"
          label="URL рабочего пространства"
          class="mb-2"
          :prefix="host"
          :rules="[validateSlug]"
          :error="isErrorSlug"
          :error-messages="errorMessageSlug"
        />
      </v-card-text>

      <v-card-actions class="pt-0 justify-end gap-3">
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
          :disabled="!isValidName || !isValidSlug || loading"
          :loading="loading"
          @click="handleCreateWorkspace"
          class="w-[110px]"
        >
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ConfirmCloseWsCreateDialog v-model="isConfirmOpen" @close="forceClose" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ConfirmCloseWsCreateDialog from './ConfirmCloseWsCreateDialog.vue';
// @ts-ignore
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import { useWorkspacesStore } from '@/stores/workspaces-store';
import { RESTRICTED_URLS } from '@/constants/constants';

const workspaceApi = new (withInterceptors(Workspace))();
const cyrillicToTranslit = CyrillicToTranslit();
const workspacesStore = useWorkspacesStore();

const isOpen = defineModel<boolean>();
const emit = defineEmits<{ wsName: [slug: string] }>();

const host = ref(
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + '/'
    : location.protocol + '//' + location.host + '/',
);

const isConfirmOpen = ref(false);
const loading = ref(false);

const isErrorSlug = ref(false);
const errorMessageSlug = ref('');
const isValidName = ref(false);
const isValidSlug = ref(false);

const workspaceValues = ref({
  name: '',
  slug: '',
});

const clear = () => {
  workspaceValues.value = {
    name: '',
    slug: '',
  };
  isErrorSlug.value = false;
  errorMessageSlug.value = '';
};

const handleClose = () => {
  if (workspaceValues.value.name || workspaceValues.value.slug) {
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

const validateName = (val: string): boolean | string => {
  isValidName.value = val.trim().length >= 3;
  return (
    val.trim().length >= 3 || 'Название должно содержать 3 или более символов'
  );
};

const validateSlug = (val: string): boolean | string => {
  const isKebab = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(val);
  const notRestricted = !RESTRICTED_URLS.includes(val);
  const minLen = val.trim().length >= 3;

  isValidSlug.value = isKebab && notRestricted && minLen;

  if (!minLen) return 'Идентификатор должен содержать 3 и более символов';
  if (!isKebab)
    return 'Разрешены только строчные буквы латинского алфавита, цифры и дефисы';
  if (!notRestricted) return 'Недопустимое системное имя пространства';
  return true;
};

const createSlug = () => {
  if (workspaceValues.value.name) {
    workspaceValues.value.slug = cyrillicToTranslit
      .transform(workspaceValues.value.name)
      .replace(/[^a-zA-Z0-9А-Яа-яЁё -]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
};

const handleCreateWorkspace = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    await workspaceApi.createWorkspace({
      name: workspaceValues.value.name,
      slug: workspaceValues.value.slug,
    });

    await workspacesStore.getUserWorkspaces();
    emit('wsName', workspaceValues.value.slug);
    forceClose();
  } catch (error: any) {
    if (error.response?.status === 409) {
      isErrorSlug.value = true;
      errorMessageSlug.value = 'Данный URL уже занят';
    }
  } finally {
    loading.value = false;
  }
};

const onDialogUpdate = (val: boolean) => {
  if (!val) clear();
};

watch(
  () => workspaceValues.value.slug,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      isErrorSlug.value = false;
      errorMessageSlug.value = '';
    }
  },
  { immediate: true },
);
</script>
