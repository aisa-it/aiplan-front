<template>
  <q-dialog
    :persistent="loading"
    ref="releaseDialogRef"
    no-refocus
    no-focus
    @hide="hideDialog"
    @show="refresh"
  >
    <q-card class="release-note-dialog">
      <q-layout
        view="hHh Lpr lff"
        container
        class="release-note-dialog__wrapper"
      >
        <q-header>
          <q-toolbar class="header row justify-between">
            <q-btn
              flat
              dense
              round
              class="q-mr-sm"
              @click="releaseDriverOpen = !releaseDriverOpen"
            >
              <MenuIcon :width="18" :height="18" />
            </q-btn>

            <q-toolbar-title> Изменения версий </q-toolbar-title>
            <q-btn
              class="q-mr-auto"
              flat
              dense
              round
              @click="releaseDialogRef.hide()"
            >
              <CloseIcon />
            </q-btn>
          </q-toolbar>
        </q-header>

        <q-drawer
          v-if="!loading && releaseNotes && releaseNotes.length"
          v-model="releaseDriverOpen"
          show-if-above
          :width="200"
          :breakpoint="780"
          bordered
          class="flex column no-wrap justify-between"
        >
          <q-list
            class="rounded-borders scrollable-content"
            style="max-height: 100%; overflow: auto"
          >
            <q-item
              v-for="release in releaseNotes"
              clickable
              :key="release.id"
              :active="release.id === currentReleaseNote?.id"
              @click="currentReleaseNote = release"
            >
              <span class="centered-horisontally">
                Версия {{ release.tag_name?.split('v')[1] }}
              </span>
            </q-item>
          </q-list>
        </q-drawer>

        <q-page-container>
          <q-inner-loading :showing="loading">
            <LoaderDefault />
          </q-inner-loading>
          <q-card-section v-if="!loading">
            <div v-if="!currentReleaseNote" class="text-h4 q-mb-md">
              Описания версий не найдены
            </div>
            <div v-if="currentReleaseNote" class="text-h4 q-mb-md">
              Версия {{ currentReleaseNote?.tag_name.split('v')[1] }}
            </div>
            <EditorTipTapV2
              v-if="currentReleaseNote"
              editor-id="release-note-preview"
              :model-value="currentReleaseNote?.body"
              disable-images
              :can-edit="false"
              read-only-editor
              style="border: 0"
            />
          </q-card-section>
        </q-page-container>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { ref } from 'vue';

// stores
import { useUtilsStore } from 'stores/utils-store';

//components
import MenuIcon from 'components/icons/MenuIcon.vue';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import LoaderDefault from 'components/loaders/DefaultLoader.vue';

// interfaces
import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import EditorTipTapV2 from '../editorV2/EditorTipTapV2.vue';

// props
const props = withDefaults(
  defineProps<{
    releaseData?: DtoReleaseNoteLight[];
  }>(),
  {
    releaseData: () => [],
  },
);

const utilsStore = useUtilsStore();

// vars
const currentReleaseNote = ref();
const releaseDialogRef = ref();
const releaseDriverOpen = ref();
const releaseNotes = ref<DtoReleaseNoteLight[]>([]);

// function
const hideDialog = () => {
  currentReleaseNote.value = null;
  loading.value = true;
};

const loading = ref(true);

const refresh = async () => {
  releaseNotes.value = [];
  currentReleaseNote.value = null;

  if (!props.releaseData?.length) {
    loading.value = true;
    await utilsStore
      .getReleaseNotes()
      .then((d) => {
        releaseNotes.value = d;
        currentReleaseNote.value = d[0] || null;
      })
      .finally(() => (loading.value = false));
    return;
  } else {
    loading.value = false;
    releaseNotes.value = props.releaseData;
    currentReleaseNote.value = props.releaseData[0] || null;
  }
};
</script>

<style scoped lang="scss">
.release-note-dialog {
  min-width: calc(100vw - 425px) !important;
  max-width: 70vw;
  height: 90vh;
  display: flex;
  border-radius: $radius;

  &__wrapper {
    :deep(.absolute-full) {
      right: 0 !important;
      .scroll {
        height: 100%;
      }
    }
  }
}

.body--light {
  .release-note-dialog {
    .q-header {
      color: $dark;
    }
  }
}

.body--dark {
  .release-note-dialog {
    .q-header {
      color: $extra-light;
    }
  }
}

:deep(.html-editor .html-editor__container) {
  border: 0;
  border-radius: 0;

  .tiptap {
    padding-left: 0;
  }
}

:deep(.html-editor__container.html-editor__readonly) {
  max-height: calc(100vh - 250px) !important;
}

@media screen and (max-width: 1000px) {
  .release-note-dialog {
    min-width: calc(100vw - 125px) !important;
  }
}
@media screen and (max-width: 600px) {
  .release-note-dialog {
    min-width: calc(100vw - 25px) !important;
  }
}
</style>
