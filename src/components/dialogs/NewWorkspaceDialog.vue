<template>
  <q-dialog ref="dialogRef" @hide="resetDialog" persistent>
    <q-card class="modal-card">
      <q-form @keydown.stop>
        <q-card-section class="column q-pt-none q-pb-none">
          <h6 class="q-ma-md">Создание рабочего пространства</h6>

          <q-input
            dense
            data-id="workspace-new-add-name"
            v-model="newWorkspaceName"
            label="Введите имя пространства"
            class="q-mb-sm base-input workspace-input"
            :rules="[validateName]"
          />
          <q-input
            dense
            data-id="workspace-new-add-url"
            v-model="newWorkspaceSlug"
            label="URL рабочего пространства"
            class="q-mb-sm base-input workspace-input"
            :prefix="host"
            :rules="[validateSlug]"
            :error="isErrorSlug"
            :error-message="errorMessageSlug"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn
            flat
            no-caps
            outline
            data-id="workspace-cancel-add"
            label="Отменить"
            style="width: 100px"
            @click="handleClose"
            class="secondary-btn"
          />
          <q-btn
            flat
            no-caps
            data-id="workspace-create-add"
            type="sumbit"
            label="Создать"
            class="primary-btn"
            style="width: 100px"
            :disable="!isValidName || !isValidSlug || loading"
            @click.stop.prevent="handleCreateWorkspace"
          />
        </q-card-actions>
      </q-form>
      <q-inner-loading :showing="loading">
        <LoaderDefault />
      </q-inner-loading>
    </q-card>
    <ConfirmCloseWsCreateDialog
      v-model="isConfirmOpen"
      @close="dialogRef.hide()"
    />
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { ref, watch } from 'vue';
import CyrillicToTranslit from 'cyrillic-to-translit-js';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import {
  maxLength,
  isKebabCase,
  validateAllowedCharacters,
  validateField,
} from 'src/utils/validation';

// constants
import {
  SUCCESS_CREATE_WS,
  ERROR_IDENTITY_SLUG,
} from 'src/constants/notifications';
import { RESTRICTED_URLS } from 'src/constants/constants';

// components
import ConfirmCloseWsCreateDialog from './ConfirmCloseWsCreateDialog.vue';
import LoaderDefault from 'components/loaders/DefaultLoader.vue';

// emits
const emits = defineEmits<{ wsName: [slug: string] }>();

// stores
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// vars
const host = ref(
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + '/'
    : location.protocol + '//' + location.host + '/',
);

const newWorkspaceName = ref('');
const newWorkspaceSlug = ref('');
const dialogRef = ref();
const isConfirmOpen = ref(false);
const isValidName = ref<boolean>(false);
const isValidSlug = ref<boolean>(false);
const isErrorSlug = ref<boolean>(false);
const errorMessageSlug = ref<string>('');
const loading = ref(false);

// function
const resetDialog = () => {
  newWorkspaceName.value = '';
  newWorkspaceSlug.value = '';
  isConfirmOpen.value = false;
};

const cyrillicToTranslit = CyrillicToTranslit();

const showOK = () =>
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_CREATE_WS,
  });

const handleClose = () => {
  if (newWorkspaceName.value || newWorkspaceSlug.value)
    isConfirmOpen.value = true;
  else dialogRef.value.hide();
};

const validateName = (val: string): boolean | string => {
  const minL =
    val.trim().length >= 3 || 'Название должно содержать 3 или более символов';
  const maxL = maxLength(val, 100);
  const characters = validateAllowedCharacters(val, 'Название');
  const validations = [minL, maxL, characters];

  return validateField(val, validations, isValidName);
};

const validateSlug = (val: string): boolean | string => {
  const minL =
    val.trim().length >= 3 ||
    'Идентификатор должен содержать 3 и более симолов';
  const maxL = maxLength(val, 50);
  const kebabCase = isKebabCase(val, 'Идентификатор');
  const rUrls =
    !RESTRICTED_URLS.includes(val) || 'Недопустимое системное имя пространства';
  const validations = [minL, maxL, kebabCase, rUrls];

  return validateField(val, validations, isValidSlug);
};

const handleCreateWorkspace = async () => {
  if (loading.value) return;

  loading.value = true;

  await workspaceStore
    .createWorkspace({
      name: newWorkspaceName.value,
      slug: newWorkspaceSlug.value,
    })
    .then(async () => {
      await userStore.getUserWorkspaces();
      showOK();
      emits('wsName', newWorkspaceSlug.value);
      dialogRef.value.hide();
    })
    .catch((error) => {
      if (error.response.status === 409) {
        isErrorSlug.value = true;
        errorMessageSlug.value = ERROR_IDENTITY_SLUG;
      }
    })
    .finally(() => (loading.value = false));
};

// hook
watch(newWorkspaceName, () => {
  newWorkspaceSlug.value = cyrillicToTranslit
    .transform(newWorkspaceName.value)
    .replaceAll(' ', '-')
    .toLowerCase();
});

watch(
  () => newWorkspaceSlug.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      isErrorSlug.value = false;
      errorMessageSlug.value = '';
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.workspace-input {
  padding-bottom: 0;

  :deep(.q-field__bottom) {
    transform: none;
    position: relative;
  }
}

@media (min-width: 600px) {
  .q-dialog__inner--minimized > div {
    width: 100%;
  }
}
</style>
