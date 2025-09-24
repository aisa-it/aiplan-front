<template>
  <div :class="`${!newIssue ? 'column-wrapper' : 'row-wrapper'}`">
    <div v-if="newIssue" class="centered-horisontally">
      <TagIcon class="mr-12" />
      <span class="q-ml-sm new-issue-label">Теги </span>
    </div>

    <div v-else class="row">
      <div class="col centered-horisontally">
        <TagIcon /> <span class="q-ml-sm">Теги</span>
      </div>
      <div class="col">
        <q-btn
          v-if="isDisabled === true"
          class="btn-sm full-w"
          no-caps
          @click="isFormTagNewOpen = true"
        >
          <AddIcon />
          <span v-if="Screen.width > 410">Создать</span>
        </q-btn>
      </div>
    </div>

    <q-select
      ref="selectTagsRef"
      use-chips
      multiple
      menu-anchor="top left"
      menu-self="bottom left"
      dense
      :virtual-scroll-sticky-size-start="50"
      :label="newIssue ? 'Выберите тег' : 'Теги'"
      popup-content-class="custom-menu scrollable-content"
      :class="`base-selector ${newIssue ? 'new-issue-btn-wrapper ' : ''}`"
      :popup-content-style="selectTagsWidth"
      :modelValue="currentTags"
      :options="labels"
      :option-label="(v) => v.name"
      :option-value="(v) => v.id"
      :disable="isDisabled === false"
      @update:model-value="
        (e) => {
          if (issueid) {
            handleSaveTags(e);
          } else {
            emits('update:tags', e || []);
          }
        }
      "
    >
      <template v-slot:before-options>
        <div class="input-search-tags">
          <q-input
            dense
            label="Поиск"
            class="base-input"
            v-model="searchLabels"
            @update:model-value="handleSearchLabels(searchLabels)"
          ></q-input>
        </div>
      </template>
      <template v-slot:selected>
        <div class="adaptive-tag">
          <template v-if="currentTags && currentTags.length">
            <q-chip
              v-for="t in currentTags"
              dense
              square
              :class="`tag q-my-none q-my-xs q-ml-xs`"
              :removable="isDisabled === true"
              :key="t.id"
              @remove="() => removeTag(t)"
            >
              <q-badge
                rounded
                :style="'background-color: ' + getCorrectColor(t.color)"
                class="q-mr-xs"
              />
              <span class="abbriviated-text">
                {{ t.name }}
                <HintTooltip>
                  <span class="word-wrap" style="width: 95%">
                    {{ t.name }}
                  </span>
                </HintTooltip>
              </span>
            </q-chip>
          </template>
        </div>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label class="flex flex-center no-wrap">
              <q-badge
                rounded
                class="q-mr-sm"
                :style="'background-color: ' + scope.opt.color"
              />
              <span class="word-wrap" style="width: 95%">
                {{ scope.opt.name }}
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:no-option>
        <div class="input-search-tags">
          <q-input
            dense
            label="Поиск"
            class="base-input"
            v-model="searchLabels"
            @update:model-value="handleSearchLabels(searchLabels)"
          ></q-input>
        </div>
        <div v-if="loading" class="row justify-center q-mb-sm">
          <DefaultLoader :size="2" unit="em" />
        </div>
        <q-item v-else>
          <q-item-section class="text-italic text-grey">
            Нет тегов
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-btn
      v-if="isDisabled === true && newIssue"
      class="btn add-tag-new-issue-btn"
      no-caps
      @click="isFormTagNewOpen = true"
    >
      <div v-if="newIssue" class="full-w centered-horisontally justify-between">
        <span v-if="Screen.width > 720">Создать</span>
        <AddIcon />
      </div>
    </q-btn>
  </div>
  <FormTagNew
    v-model="isFormTagNewOpen"
    @refresh="refresh"
    @add="handleAddTag"
  />
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { QSelect, Screen, debounce } from 'quasar';
import { nextTick, onMounted, ref, watch } from 'vue';

// stores
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';

//utils
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
import { usePalette } from 'src/modules/project-settings/labels/composables/usePalette';

// interfaces
import type { ITag } from 'src/interfaces/tags';

// components
import FormTagNew from './FormTagNew.vue';
import TagIcon from './icons/TagIcon.vue';
import AddIcon from 'src/components/icons/AddIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = withDefaults(
  defineProps<{
    projectid: string;
    issueid?: string;
    tags: ITag[];
    isDisabled?: boolean;
    newIssue?: boolean;
  }>(),
  { newIssue: () => true },
);
const emits = defineEmits<{
  refresh: [];
  'update:tags': [tags: ITag[]];
}>();

const { getCorrectColor } = usePalette();

const api = useAiplanStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const labels = ref<DtoLabelLight[]>([]);
const currentTags = ref<ITag[]>([]);
const isFormTagNewOpen = ref(false);
const searchLabels = ref();
const loading = ref(false);
const selectTagsRef = ref<QSelect>();
const { getWidthStyle: selectTagsWidth } =
  useResizeObserverSelect(selectTagsRef);

const refresh = async (resetTags = true) => {
  if (props.newIssue && resetTags) {
    emits('update:tags', []);
  }

  await projectStore
    .getProjectLabels(currentWorkspaceSlug.value as string, props.projectid)
    .then((data) => {
      labels.value = data;
    })
    .finally(() => {
      nextTick(() => {
        setTimeout(() => selectTagsRef.value?.updateMenuPosition(), 100);
      });
    });
};

const handleSaveTags = (tags: ITag[]) =>
  api
    .issuePartialUpdate(
      currentWorkspaceSlug.value as string,
      props.projectid,
      props.issueid as string,
      {
        labels_list: tags.map((tag) => tag.id) || [],
      },
    )
    .then(() => {
      setNotificationView({ type: 'success', open: true });
      emits('refresh');
    });

const removeTag = (tagToRemove: ITag) => {
  currentTags.value = currentTags.value.filter(
    (tag) => tag.id !== tagToRemove.id,
  );
  if (props.issueid) handleSaveTags(currentTags.value);
  else emits('update:tags', currentTags.value);
};

const handleAddTag = (newTag: ITag) => {
  if (props.issueid) {
    api
      .issuePartialUpdate(
        currentWorkspaceSlug.value as string,
        props.projectid,
        props.issueid,
        {
          labels_list: [...currentTags.value.map((tag) => tag.id), newTag.id],
        },
      )
      .then(() => {
        refresh();
        setNotificationView({ type: 'success', open: true });
        emits('refresh');
      });
  } else {
    refresh();
    emits('update:tags', [...currentTags.value, newTag]);
  }
};

onMounted(() => {
  refresh();
});

const handleSearchLabels = debounce(async (searchQuery: string) => {
  if (!searchQuery) return refresh(false);

  labels.value = [];

  loading.value = true;
  await projectStore
    .getProjectLabels(currentWorkspaceSlug.value as string, props.projectid, {
      search_query: searchQuery,
    })
    .then((data) => {
      labels.value = data;
      loading.value = false;
    })
    .catch(() => (loading.value = false))
    .finally(() => {
      nextTick(() => {
        setTimeout(() => selectTagsRef.value?.updateMenuPosition(), 100);
      });
    });
}, 700);
watch(
  () => props.projectid,
  () => refresh(),
  {
    immediate: true,
  },
);
watch(
  () => props.tags,
  () => (currentTags.value = props.tags),
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.tag {
  font-size: 12px;
  color: $dark;
  background-color: $bg-surface-2;
}

.adaptive-tag {
  width: 100%;
}

.column-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
}

.row-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media screen and (max-width: 720px) {
    justify-content: normal;
  }
}

.new-issue-tags {
  max-width: 66% !important;
  min-width: 66% !important;

  .q-field__control {
    height: 40px;
    overflow: hidden;
    width: 100% !important;

    .q-field__native {
      padding-top: 0 !important;
    }
  }
}

.new-issue-btn-wrapper {
  width: 60%;
}
.add-tag-new-issue-btn {
  width: 20%;
}

@media screen and (max-width: 720px) {
  .new-issue-btn-wrapper {
    width: 100%;
  }

  .new-issue-tags {
    max-width: 49% !important;
    min-width: 49% !important;
  }

  .add-tag-new-issue-btn {
    width: auto;
  }

  .new-issue-label {
    display: none;
  }
}

.new-issue-btn {
  min-height: 40px !important;
  width: 100% !important;

  .q-btn__content {
    justify-content: space-between !important;
    flex-wrap: nowrap;
  }
}

.custom-menu {
  max-height: 320px !important;
  overflow-y: auto !important;

  .q-item {
    border: none !important;
  }
}
</style>
