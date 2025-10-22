<template>
  <q-dialog class="issue-tags-dialog" @hide="resetData">
    <q-card class="modal-card q-pt-sm q-px-lg q-pb-lg" style="max-width: 500px">
      <h6 class="q-my-sm">Выберите теги</h6>
      <div class="flex no-wrap q-mb-md">
        <q-input
          class="base-input full-w"
          label="Поиск"
          dense
          v-model="searchQuery"
          @update:model-value="handleSearchLabels(searchQuery)"
        ></q-input>
        <q-btn
          v-if="!isDisabled"
          class="btn-only-icon-sm"
          @click="isFormTagNewOpen = !isFormTagNewOpen"
        >
          <AddIcon></AddIcon>
        </q-btn>
      </div>
      <div class="issue-tags-wrapper q-pr-sm q-mb-md">
        <div class="flex items-center q-mb-md">
          <q-chip
            v-for="t in currentTags"
            :key="t.id"
            :class="[
              'issue-chip q-my-xs q-ml-none q-mr-sm',
              canRemoveTag(t) ? 'issue-chip--removable' : '',
            ]"
            :ripple="false"
            :removable="canRemoveTag(t)"
            @remove="() => removeTag(t)"
          >
            <q-badge
              rounded
              :style="'background-color: ' + getCorrectColor(t.color)"
              class="q-mr-sm"
            />
            <span class="abbriviated-text q-mr-xs">
              {{ t.name }}
              <HintTooltip>
                <span class="word-wrap" style="width: 95%">
                  {{ t.name }}
                </span>
              </HintTooltip>
            </span>
          </q-chip>
        </div>
        <div
          v-if="loading"
          class="row justify-center full-w q-py-sm"
          style="align-items: center"
        >
          <DefaultLoader :size="40" />
        </div>
        <div v-else>
          <div v-if="labels.length">
            <div v-for="t in labels" :key="t.id" class="q-mb-sm">
              <q-checkbox
                v-model="selectedTags"
                :val="t.id"
                :label="t.name"
                :key="t.id"
                :disable="isCheckboxDisabled(t)"
                dense
                @update:model-value="(val) => updateTagState(val, t)"
              />
            </div>
          </div>
          <div v-else class="text-italic text-grey q-pb-md">Нет тегов</div>
        </div>
      </div>
      <q-card-actions align="right" class="q-pa-none">
        <q-btn unelevated class="secondary-btn" no-caps @click="closeDialog">
          Отмена
        </q-btn>
        <q-btn unelevated class="primary-btn" no-caps @click="handleSaveTags">
          Сохранить
        </q-btn>
      </q-card-actions>
    </q-card>

    <FormTagNew
      v-model="isFormTagNewOpen"
      @refresh="refresh"
      @add="handleAddTag"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { debounce } from 'quasar';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useProjectStore } from 'src/stores/project-store';
import { useNotificationStore } from 'stores/notification-store';
import AddIcon from 'src/components/icons/AddIcon.vue';
import FormTagNew from 'src/components/FormTagNew.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import type { ITag } from 'src/interfaces/tags';
import { BASE_ERROR_RULES } from 'src/constants/notifications';
import { usePalette } from 'src/modules/project-settings/labels/composables/usePalette';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  tags: ITag[];
  isDisabled?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  add: [];
  refresh: [];
  'update:tags': [tags: ITag[]];
}>();

const { getCorrectColor } = usePalette();

const api = useAiplanStore();
const route = useRoute();
const projectStore = useProjectStore();
const { setNotificationView } = useNotificationStore();
const singleIssueStore = useSingleIssueStore();
const { currentIssueID } = storeToRefs(singleIssueStore);

const labels = ref<ITag[]>([]);
const currentTags = ref<ITag[]>([]);
const selectedTags = ref<string[]>([]);
const isFormTagNewOpen = ref(false);
const searchQuery = ref();
const loading = ref(false);

const currentTagsId = computed(() => currentTags.value.map((tag) => tag.id));

const canRemoveTag = (tag: ITag) => {
  return !props.isDisabled || !props.tags.find((item) => item.id === tag.id);
};

const isCheckboxDisabled = (tag: ITag) => {
  return props.isDisabled && props.tags.map((item) => item.id).includes(tag.id);
};

const handleSearchLabels = debounce(async (query: string) => {
  if (!query) return refresh(false);

  labels.value = [];

  loading.value = true;
  await projectStore
    .getProjectLabels(route.params.workspace, route.params.project, query)
    .then((data) => {
      labels.value = data;
      loading.value = false;
    })
    .catch(() => (loading.value = false));
}, 700);

const handleAddTag = (newTag: ITag) => {
  if (route.params?.issue) {
    api
      .issuePartialUpdate(
        route.params.workspace,
        route.params.project,
        currentIssueID.value,
        {
          labels_list: [...currentTagsId.value, newTag.id],
        },
      )
      .then(() => {
        refresh();
        setNotificationView({ type: 'success', open: true });
        emit('refresh');
      });
  } else {
    refresh();
    emit('update:tags', [...currentTags.value, newTag]);
  }
};

const refresh = async (resetTags = true) => {
  if (resetTags) {
    emit('update:tags', []);
  }

  await projectStore
    .getProjectLabels(route.params.workspace, route.params.project)
    .then((data) => {
      labels.value = data;
    });
};

const removeTag = (tag: ITag) => {
  currentTags.value = currentTags.value.filter((item) => item.id !== tag.id);
  selectedTags.value = selectedTags.value.filter((id) => id !== tag.id);
};

const handleSaveTags = () => {
  if (props.isDisabled) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: BASE_ERROR_RULES,
    });
    emit('close');
    return;
  }
  api
    .issuePartialUpdate(
      route.params.workspace,
      route.params.project,
      currentIssueID.value,
      {
        labels_list: currentTagsId.value || [],
      },
    )
    .then(() => {
      setNotificationView({ type: 'success', open: true });
      emit('refresh');
    })
    .finally(() => emit('close'));
};

const updateTagState = (val: string[], tag: ITag) => {
  if (currentTagsId.value.includes(tag.id)) {
    removeTag(tag);
  } else {
    currentTags.value.push(tag);
  }
};

const setCurrentTags = () => {
  currentTags.value = [...props.tags];
  selectedTags.value = props.tags.map((tag) => tag.id);
};

const resetData = () => {
  setCurrentTags();
  refresh();
};

const closeDialog = () => {
  emit('close');
  resetData();
};

watch(
  () => props.tags,
  () => setCurrentTags(),
  {
    immediate: true,
  },
);

onMounted(() => {
  refresh();
});
</script>

<style lang="scss">
.issue-tags-dialog {
  .modal-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .issue-chip {
    font-weight: 500;
  }
}
.issue-tags-wrapper {
  overflow: auto;
}
</style>
