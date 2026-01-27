<template>
  <div class="row mobile-block">
    <div class="col q-mb-lg">
      <h4 class="text-lg font-semibold text-brand-base">
        Эмодзи или изображение
      </h4>
      <p class="text-sm text-brand-secondary q-mb-none">
        Поддерживается .jpg, .png, и .gif
      </p>
    </div>
    <div class="row items-center col q-mt-xs">
      <q-img
        class="q-mr-md"
        v-if="projectForm.logo"
        :src="`${projectForm.logo ? getUrlFile(projectForm.logo) : ''}`"
        :style="`width: 48px; height: 48px; border-radius: 4px; color: white;`"
      />
      <DefaultImage v-else class="q-mr-md" />
      <div class="row gap-md items-center">
        <q-btn
          class="secondary-btn"
          style="width: 110px"
          no-caps
          @click="toggleUploaderState"
        >
          Загрузить
        </q-btn>
        <p class="q-mb-none" v-if="!projectForm.logo">или</p>
        <q-select
          v-if="!projectForm.logo"
          ref="emojiSelectRef"
          v-model="projectForm.emoji"
          dense
          class="base-selector"
          virtual-scroll-horizontal
          popup-content-class="emoji-popup scrollable-content"
          :popup-content-style="emojiSelectWidth"
          :virtual-scroll-slice-size="PROJECT_EMOJI_OPTIONS?.length"
          @click="emojiSelectRef.refresh()"
          @popup-show="emojiSelectRef.refresh()"
          :options="PROJECT_EMOJI_OPTIONS"
        />
        <q-btn
          v-if="projectForm.logo"
          class="delete-btn"
          style="width: 110px"
          no-caps
          @click="deleteAvatar"
        >
          Удалить
        </q-btn>
      </div>
    </div>
  </div>

  <div class="row mobile-block q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Имя</h4>
      <p class="text-sm text-brand-secondary">Имя проекта</p>
    </div>
    <div class="col q-mt-xs">
      <q-input
        v-model="projectForm.name"
        dense
        label="Имя проекта"
        class="base-input"
        :rules="[validateName]"
      />
    </div>
  </div>

  <div class="row mobile-block q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Идентификатор</h4>
      <p class="text-sm text-brand-secondary">Идентификатор проекта</p>
    </div>
    <div class="col q-mt-xs">
      <q-input
        dense
        class="base-input"
        v-model="projectForm.identifier"
        label="Идентификатор проекта"
        :rules="[validateIdentifier]"
        @update:model-value="
          (value: any) => (projectForm.identifier = value.toUpperCase())
        "
      />
    </div>
  </div>

  <div class="row mobile-block q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Приватность</h4>
      <p class="text-sm text-brand-secondary">Приватность проекта</p>
    </div>
    <div class="col q-mt-xs">
      <q-select
        ref="selectNetworkRef"
        v-model="projectForm.public"
        dense
        label="Приватность проекта"
        class="base-selector"
        :options="NETWORK_CHOICES"
        :popup-content-style="selectNetworkWidth"
      />
    </div>
  </div>

  <q-card-actions style="background-color: transparent" align="right">
    <q-btn
      flat
      no-caps
      outline
      class="secondary-btn"
      :disable="!isValidName || !isValidIdentifier"
      @click="onSubmit"
    >
      Сохранить
    </q-btn>
  </q-card-actions>

  <div v-if="rolesStore.hasPermission('delete-project')">
    <div class="row mobile-block q-mt-md">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Удалить проект</h4>
        <p class="text-sm text-brand-secondary">
          Проект будет удален безвозвратно
        </p>
      </div>
      <div class="col">
        <q-card-actions style="background-color: transparent" align="right">
          <q-btn
            no-caps
            class="delete-btn"
            @click="isDeleteOpen = !isDeleteOpen"
          >
            Удалить проект
          </q-btn>
        </q-card-actions>
      </div>
    </div>
  </div>

  <DeleteProjectDialog
    v-model="isDeleteOpen"
    :currentProject="project"
    @start-loading="loading = true"
    @end-loading="loading = false"
  />
  <UploadAvatarDialog
    v-model="isOpenUploadDialog"
    @upload="uploadProjectAvatar"
  />
  <q-inner-loading :showing="loading">
    <DefaultLoader />
  </q-inner-loading>
</template>
<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import DefaultImage from 'src/components/icons/DefaultImage.vue';
import DeleteProjectDialog from 'src/modules/project-settings/general/ui/dialogs/DeleteProjectDialog.vue';
import UploadAvatarDialog from 'src/components/UploadAvatarDialog.vue';

// helpers
import {
  maxLength,
  isUpperCaseAndNumber,
  validateAllowedCharacters,
} from 'src/utils/validation';
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';
import { getUrlFile } from 'src/utils/helpers';

// constants
import { NETWORK_CHOICES } from 'src/constants/constants';
import { PROJECT_EMOJI_OPTIONS } from 'src/constants/emojis';

// interfaces
import { IProject } from 'src/interfaces/projects';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

// services
import {
  updateProject,
  updateProjectLogo,
  deleteProjectLogo,
} from '../../services/api';

//routes
const router = useRouter();

// stores
const userStore = useUserStore();
const rolesStore = useRolesStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// store to refs
const { project } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
// vars
const isDeleteOpen = ref(false);
const isOpenUploadDialog = ref(false);
const loading = ref(false);
const projectForm = ref(Object.assign({}, project.value));
const isValidName = ref<boolean>(false);
const isValidIdentifier = ref<boolean>(false);

const emojiSelectRef = ref();
const { getWidthStyle: emojiSelectWidth } =
  useResizeObserverSelect(emojiSelectRef);
const selectNetworkRef = ref();
const { getWidthStyle: selectNetworkWidth } =
  useResizeObserverSelect(selectNetworkRef);

const updateStores = async () => {
  await Promise.all([
    projectStore.getProjectInfo(
      currentWorkspaceSlug.value as string,
      project.value.id,
    ),
    workspaceStore.getWorkspaceProjects(currentWorkspaceSlug.value as string),
    userStore.getFavouriteProjects(currentWorkspaceSlug.value as string),
  ]);
  router.replace({
    name: 'project-settings',
    params: { project: projectForm.value.identifier },
  });
};

async function updateThisProject(payload: Partial<IProject>) {
  await updateProject(
    currentWorkspaceSlug.value as string,
    project.value.id,
    payload,
  )
    .then(async () => {
      await updateStores();
    })
    .then(() =>
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_UPDATE_DATA,
      }),
    );
}

async function onSubmit() {
  if (!projectForm.value) return;

  const payload: Partial<IProject> = {
    name: projectForm.value.name,
    identifier: projectForm.value.identifier,
    public: projectForm.value.public.value || false,
    emoji: projectForm.value.emoji.value,
  };

  await updateThisProject(payload);
}

const validateName = (val: string): boolean | string => {
  isValidName.value = false;
  const minL =
    val.trim().length >= 1 || 'Название должно содержать 1 или более символов';
  const maxL = maxLength(val, 100);
  const characters = validateAllowedCharacters(val, 'Название');

  if (typeof minL === 'string') {
    return minL;
  } else if (typeof maxL === 'string') {
    return maxL;
  } else if (typeof characters === 'string') {
    return characters;
  }

  isValidName.value = true;
  return true;
};

const validateIdentifier = (val: string): boolean | string => {
  isValidIdentifier.value = false;
  const minL =
    val.trim().length >= 3 ||
    'Идентификатор должен содержать 3 и более симолов';
  const maxL = maxLength(val, 10);
  const upperCaseAndNumber = isUpperCaseAndNumber(val, 'Идентификатор');

  if (typeof minL === 'string') {
    return minL;
  } else if (typeof maxL === 'string') {
    return maxL;
  } else if (typeof upperCaseAndNumber === 'string') {
    return upperCaseAndNumber;
  }

  isValidIdentifier.value = true;
  return true;
};

const toggleUploaderState = () => {
  isOpenUploadDialog.value = true;
};

const uploadProjectAvatar = async (image: File) => {
  await updateProjectLogo(
    currentWorkspaceSlug.value as string,
    project.value.id,
    { file: image },
  ).then(() => {
    projectForm.value.emoji = PROJECT_EMOJI_OPTIONS.find(
      (el) => el.label === '💼',
    );
    onSubmit();
  });
};

const deleteAvatar = async () => {
  await deleteProjectLogo(
    currentWorkspaceSlug.value as string,
    project.value.id,
  )
    .then(async () => {
      await updateStores();
    })
    .then(() => {
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Изображение проекта удалено',
      });
    });
};

watch(
  () => project.value,
  (newValue) => {
    if (newValue) {
      projectForm.value = Object.assign({}, newValue);
      validateName(projectForm.value.name);
      validateIdentifier(projectForm.value.identifier);
    }
  },
  {
    immediate: true,
  },
);
</script>
<style lang="scss" scoped>
h4 {
  margin-top: 0;
}
</style>
