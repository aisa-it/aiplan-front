<template>
  <LoadPage v-if="project === undefined" />
  <q-page v-else class="q-pa-md">
    <q-card class="new-issue-template-сard" ref="newIssueTemplateCardRef">
      <q-card-section class="q-pa-none">
        <div :style="'position: relative'">
          <div class="row q-mb-xs new-issue-template-header reverse-wrap">
            <q-input
              dense
              v-model="name"
              class="col-12 q-ml-sm base-input new-issue-template-title-input"
              label="Название"
              ref="titleRef"
              :rules="[
                (val) =>
                  (val && val.length > 0) || 'Необходимо ввести название',
              ]"
            />

            <div class="col-12 flex new-issue-template-select-container">
              <SelectSingleIssueTemplate
                v-model="issueTemplate"
                :options="options"
                :loading="templatesLoading"
                @delete="handleDeleteIssueTemplate"
                @clear="handleClear"
                @virtual-scroll="
                  (arg) => fetchOnScroll(workspaceSlug, projectId, arg)
                "
              />

              <q-btn
                flat
                dense
                no-caps
                class="primary-btn q-ml-sm"
                style="max-height: 40px"
                @click="handleClear()"
              >
                <AddIcon color="#fff" />
                <p v-if="!isMobile" class="q-ma-none">Создать шаблон</p>
              </q-btn>
            </div>
          </div>

          <EditorTipTapV2
            v-model="editorValue"
            :members="projectMembers"
            @get-editor="getEditorInstance"
            is-mention
            disable-images
            editor-id="new-issue-template-editor"
            :excluded-tabs="[TIPTAP_TABS.drawio]"
          />
        </div>
      </q-card-section>
      <q-card-actions class="new-issue-buttons q-px-md">
        <div class="submit-buttons">
          <q-btn
            v-if="editorValue != '<p></p>' || issueTemplate?.id"
            flat
            dense
            no-caps
            class="secondary-btn q-mr-sm"
            :style="{ width: isIssueTemplateSelected ? '140px' : '100px' }"
            label="Очистить"
            @click="handleClear"
            :disable="templatesLoading"
          />
          <q-btn
            flat
            dense
            no-caps
            class="primary-btn"
            :style="{ width: isIssueTemplateSelected ? '140px' : '105px' }"
            :label="isIssueTemplateSelected ? 'Редактировать' : 'Сохранить'"
            @click="handleCreateIssueTemplate()"
            :disable="!name || templatesLoading || editorValue == '<p></p>'"
          >
            <HintTooltip v-if="!name || editorValue == '<p></p>'">
              <p v-if="!name">Необходимо ввести название шаблона</p>
              <p v-else>Необходимо заполнить шаблон</p>
            </HintTooltip>
          </q-btn>
        </div>
      </q-card-actions>
      <q-inner-loading :showing="templatesLoading">
        <DefaultLoader />
      </q-inner-loading>
    </q-card>
    <ConfirmLostEditionTemplate
      v-model="showDialog"
      @close-edition="handleCloseEdition"
      @back-to-edition="handleBackToEdition"
    />
  </q-page>
</template>

<script setup lang="ts">
//core
import { storeToRefs } from 'pinia';
import { useRoute, useRouter, onBeforeRouteLeave, RouteLocationNormalizedGeneric } from 'vue-router';
import { ref, onMounted, watch, computed } from 'vue';
import { Editor } from '@tiptap/vue-3';
// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
// components
import { useProjectStore } from 'src/stores/project-store';
import LoadPage from 'src/pages/LoadPage.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
// constants
import { TIPTAP_TABS } from 'src/constants/tiptap';
// components
import SelectSingleIssueTemplate from './SelectSingleIssueTemplate.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
//types
import { QCard, Screen } from 'quasar';
//composables
import { useSingleIssueTemplate } from 'src/modules/single-issue/linked-issues/composables/useSingleIssueTemplate';
import AddIcon from 'src/components/icons/AddIcon.vue';
import ConfirmLostEditionTemplate from 'src/modules/project-settings/new-issue-template/ui/ConfirmLostEditionTemplate.vue';

const props = defineProps<{
  openDialog: boolean;
}>();
const emit = defineEmits(['setRestriction', 'backToEdition']);

//composables
const route = useRoute();
const router = useRouter();
const {
  options,
  loading: templatesLoading,
  fetchTemplates,
  deleteTemplate,
  createSingleIssueTemplate,
  fetchOnScroll,
  updateTemplate,
} = useSingleIssueTemplate();

//stores
const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { projectMembers } = storeToRefs(projectStore);
const { project } = storeToRefs(projectStore);

//state
const newIssueCardRef = ref<QCard>();
const titleRef = ref();
const name = ref('');
const editorValue = ref('');
const issueTemplate = ref<any>(null);
const editorInstance = ref<Editor>();
const showDialog = ref<boolean>(false);
const isContentUnsaved = ref<boolean>(false);
const isNameUnsaved = ref<boolean>(false);
const pendingRoute = ref<RouteLocationNormalizedGeneric | null>();
const isLeavingTabRestricted = ref<boolean>(false);

//computeds
const workspaceSlug = computed(() => {
  return route.params.workspace as string;
});
const projectId = computed(() => {
  return route.params.project as string;
});
const isIssueTemplateSelected = computed(() => {
  return issueTemplate.value && issueTemplate.value.id;
});
const isMobile = computed(() => Screen.width <= 720);
const areUnsavedData = computed(() => (isContentUnsaved.value || isNameUnsaved.value));

//methods
const handleCreateIssueTemplate = async () => {
  if (!currentWorkspaceSlug.value) return;
  titleRef.value.validate();

  if (titleRef.value.hasError) {
    newIssueCardRef.value?.$el.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    return;
  }
  const content = await handleEditorValue(editorValue.value);
  if (!content.html) return;

  try {
    if (isIssueTemplateSelected.value) {
      await updateTemplate(
        workspaceSlug.value,
        projectId.value,
        issueTemplate.value.id,
        content.html,
        name.value,
      );
    } else {
      await createSingleIssueTemplate(
        workspaceSlug.value,
        projectId.value,
        content.html,
        name.value,
      );
    }
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: isIssueTemplateSelected.value
        ? 'Шаблон задачи успешно обновлен'
        : 'Шаблон задачи успешно создан',
    });
  } catch (error) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: isIssueTemplateSelected.value
        ? 'Ошибка при обновлении шаблона задачи'
        : 'Ошибка при создании шаблона задачи',
    });
    console.error('Error creating issue template:', error);
  } finally {
    await fetchTemplates(workspaceSlug.value, projectId.value, true);

    if (isIssueTemplateSelected.value) {
      issueTemplate.value = options.value.find(
        (template) => template.id === issueTemplate.value.id,
      );
    } else {
      issueTemplate.value = options.value[0];
      editorValue.value = issueTemplate.value?.template || '';
      name.value = issueTemplate.value?.name || '';
    }

    savedContent.value = issueTemplate.value?.template || '';
    savedName.value = issueTemplate.value?.name || '';
  }
};

const handleDeleteIssueTemplate = async (id: string) => {
  try {
    await deleteTemplate(workspaceSlug.value, projectId.value, id);
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Шаблон задачи успешно удален',
    });
    if (issueTemplate.value?.id === id) {
      handleClear();
    }
    await fetchTemplates(workspaceSlug.value, projectId.value, true);
  } catch (error) {}
};

const getEditorInstance = (editor: Editor) => {
  editorInstance.value = editor;
};

const resetSavedData = () => {
  savedContent.value = '<p></p>';
  savedName.value = '';
  isContentUnsaved.value = false;
  isNameUnsaved.value = false;
}

const handleClear = () => {
  issueTemplate.value = null;

  if (editorInstance.value) {
    editorInstance.value?.chain().focus().clearContent().run();
  }
  name.value = '';

  resetSavedData();
};

const handleBackToEdition = () => {
  showDialog.value = false;
  pendingRoute.value = null;
  emit('backToEdition');
}

const handleCloseEdition = () => {
  showDialog.value = false;
  isLeavingTabRestricted.value = false;

  if (pendingRoute.value) {
    router.push(pendingRoute.value);
  }
  emit('setRestriction', false)
}

const savedContent = ref<string | null>();
const savedName = ref<string | null>();

//hooks
onMounted(async () => {
  fetchTemplates(workspaceSlug.value, projectId.value, true);

  if (issueTemplate.value) {
    savedName.value = issueTemplate.value.name;
    savedContent.value = issueTemplate.value.template;
  } else {
    savedName.value = name.value;
    savedContent.value = editorValue.value || '<p></p>';
  }
});

onBeforeRouteLeave(async (to, _, next) => {
  if (areUnsavedData.value) {
    if (!isLeavingTabRestricted.value) {
      if (pendingRoute.value) {
        next();
        pendingRoute.value = null;
      } else {
        next(false);
      }
    } else {
      showDialog.value = true;
      pendingRoute.value = to;
      next(false);
    }
  } else {
    next();
  }
});

watch(
  () => issueTemplate.value,
  async (newTemplate) => {
    if (newTemplate && newTemplate.template && editorInstance.value) {
      editorInstance.value
        .chain()
        .focus()
        .clearContent()
        .insertContent(newTemplate.template)
        .run();
      name.value = newTemplate.name || '';

      savedContent.value = editorValue.value;
      savedName.value = name.value;

      isContentUnsaved.value = false;
      isNameUnsaved.value = false;

    } else {
      resetSavedData();
    }
  },
);

watch(() => name.value, (newName) => {
  isNameUnsaved.value = newName !== savedName.value;
});

watch(() => editorValue.value, (newContent) => {
  isContentUnsaved.value = newContent !== savedContent.value;
});

watch(() => areUnsavedData.value, () => {
  emit('setRestriction', areUnsavedData.value);
  isLeavingTabRestricted.value = areUnsavedData.value;
});

watch(() => props.openDialog, () => {
  showDialog.value = props.openDialog;
})

</script>

<style lang="scss" scoped>
.new-issue-template-сard {
  width: 100%;
  min-width: none;
  box-shadow: none;
}

.new-issue-card {
  min-width: 66vw !important;
}

.new-issue-buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.new-issue-template-select-container {
  margin-bottom: 8px;
}

:deep(.html-editor) {
  overflow: visible !important;
}

:deep(.html-editor__toolbar) {
  position: sticky;
  top: 50px;
  z-index: 10;
  background-color: $bg-color;
}

@media screen and (max-width: 720px) {
  .issue-selector-label {
    display: none;
  }

  .new-issue-buttons {
    flex-direction: column;
    align-items: start;
    .submit-buttons {
      display: flex;
      flex-direction: row;
      width: 100%;
      .q-btn {
        width: 100% !important;
      }
    }
  }
}

@media screen and (min-width: 720px) {
  .issue-selector-icon {
    display: none;
  }
}
</style>
