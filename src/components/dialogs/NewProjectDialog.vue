<template>
  <q-dialog @hide="clear" ref="dialogRef" persistent>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none q-pb-none">
        <h6 class="q-ma-md">Создание нового проекта</h6>
        <q-input
          dense
          v-model="projectValues.name"
          label="Введите имя проекта"
          class="q-mb-sm base-input project-input"
          :rules="[validateName]"
          @update:model-value="createIdentifier"
        />
        <div class="row">
          <div class="col">
            <q-input
              v-model="projectValues.identifier"
              dense
              label="Введите идентификатор проекта"
              class="q-mb-sm base-input project-input"
              :rules="[validateIdentifier]"
              :error="isProjectIdentifier"
              :error-message="errorMessageProjectIdentifier"
              @update:model-value="
                (val) => {
                  if (val)
                    projectValues.identifier = val.toString().toUpperCase();
                }
              "
            />
          </div>
          <div class="col" :style="'max-width: 150px; margin-left: 4px;'">
            <q-select
              dense
              v-model="projectValues.public"
              class="base-selector"
              :options="NETWORK_CHOICES"
            >
            </q-select>
          </div>
          <div class="col" :style="'max-width: 70px; margin-left: 4px;'">
            <q-select
              ref="emojiSelect"
              dense
              class="base-selector emoji-select"
              v-model="projectValues.emoji_and_icon"
              :options="emojiOptions"
              virtual-scroll-horizontal
              popup-content-class="emoji-popup scrollable-content"
              :virtual-scroll-slice-size="emojiOptions?.length"
              @popup-show="emojiSelect.refresh()"
              @click="emojiSelect.refresh()"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pt-none">
        <q-btn
          flat
          no-caps
          outline
          label="Отменить"
          class="secondary-btn"
          @click="handleClose"
          style="width: 100px"
        />
        <q-btn
          flat
          no-caps
          label="Создать"
          class="primary-btn"
          :disable="!isValidName || !isValidIdentifier"
          @click="createNewProject"
          style="width: 100px"
        />
      </q-card-actions>
    </q-card>
    <ConfirmCloseProjectCreate
      v-model="isConfirmOpen"
      @close="dialogRef.hide()"
    />
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import CyrillicToTranslit from 'cyrillic-to-translit-js';

// store
import { useUserStore } from 'src/stores/user-store';
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import {
  maxLength,
  validateField,
  isUpperCaseAndNumber,
  validateAllowedCharacters,
} from 'src/utils/validation';
import { sortStates } from 'src/utils/sort';
import { getRandomEmoji } from 'src/utils/helpers';

// constants
import { NETWORK_CHOICES } from 'src/constants/constants';
import { PROJECT_EMOJIS, PROJECT_EMOJI_OPTIONS } from 'src/constants/emojis';
import { SUCCESS_PROJECT_CREATE } from 'src/constants/notifications';

// interfaces
import { IStateResponse } from 'src/interfaces/states';

// components
import ConfirmCloseProjectCreate from './ConfirmCloseProjectCreateDialog.vue';

// store
const userStore = useUserStore();
const statesStore = useStatesStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
// store to refs
const { statesCache } = storeToRefs(statesStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const cyrillicToTranslit = CyrillicToTranslit();
const emojiOptions = PROJECT_EMOJI_OPTIONS;
const dialogRef = ref();
const emojiSelect = ref();
const isConfirmOpen = ref<boolean>(false);
const isValidName = ref<boolean>(false);
const isValidIdentifier = ref<boolean>(false);
const isProjectIdentifier = ref<boolean>(false);
const errorMessageProjectIdentifier = ref<string>('');
const projectValues = ref({
  name: '',
  identifier: '',
  description: '',
  public: { value: true, label: 'Публичный' },
  emoji_and_icon: emojiOptions.find((el) => el.label === '💼'),
  cover_image: '',
});

// function
const clear = () => {
  projectValues.value = {
    name: '',
    identifier: '',
    description: '',
    public: { value: true, label: 'Публичный' },
    emoji_and_icon: emojiOptions.find((el) => el.label === '💼'),
    cover_image: '',
  };
  isConfirmOpen.value = false;
  isProjectIdentifier.value = false;
  errorMessageProjectIdentifier.value = '';
};

const handleClose = () => {
  if (projectValues.value.identifier || projectValues.value.name)
    isConfirmOpen.value = true;
  else dialogRef.value.hide();
};

const validateName = (val: string): boolean | string => {
  isValidName.value = false;
  const minL =
    val.trim().length >= 1 || 'Название должно содержать 1 или более символов';
  const maxL = maxLength(val, 100);
  const characters = validateAllowedCharacters(val, 'Название');

  const validations = [minL, maxL, characters];

  return validateField(val, validations, isValidName);
};

const validateIdentifier = (val: string): boolean | string => {
  isValidIdentifier.value = false;
  const minL =
    val.trim().length >= 3 ||
    'Идентификатор должен содержать 3 и более симолов';
  const maxL = maxLength(val, 10);
  const upperCaseAndNumber = isUpperCaseAndNumber(val, 'Идентификатор');
  const validations = [minL, maxL, upperCaseAndNumber];

  return validateField(val, validations, isValidIdentifier);
};

const createIdentifier = () => {
  projectValues.value.identifier = cyrillicToTranslit
    .transform(projectValues.value.name.replace(/ /g, '').substring(0, 3))
    .toUpperCase();
};

const createNewProject = async () => {
  const payload = {
    cover_image: '/images/vercel.jpeg',
    description: '',
    emoji: projectValues.value.emoji_and_icon.value
      ? projectValues.value.emoji_and_icon.value
      : getRandomEmoji(PROJECT_EMOJIS),
    identifier: projectValues.value.identifier,
    name: projectValues.value.name,
    public: projectValues.value.public.value,
  };
  await projectStore
    .createProject(currentWorkspaceSlug.value, payload)
    .then(async () => {
      await workspaceStore
        .getAllWorkspaceStates(currentWorkspaceSlug.value)
        .then(() => {
          let obj: IStateResponse = {};
          for (let o in workspaceStore.allWorkspaceStates) {
            obj[o] = sortStates(workspaceStore.allWorkspaceStates[o]);
          }

          statesCache.value = obj;
        });
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_PROJECT_CREATE,
      });
      dialogRef.value.hide();
      clear();
    })
    .then(async () => {
      await workspaceStore.getWorkspaceProjects(currentWorkspaceSlug.value);
      await userStore.getUserProjects();
    });
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

<style scoped lang="scss">
.project-input {
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
