<template>
  <main class="mx-auto flex w-full max-w-[960px] flex-col gap-4 p-4 sm:p-8">
    <header>
      <h1 class="text-2xl font-medium">Editor playground</h1>
      <p class="mt-1 text-secondary">Документы пространства {{ workspaceSlug }}</p>
    </header>

    <v-card>
      <v-card-title>Документ API</v-card-title>
      <v-card-text>
        <v-autocomplete
          :model-value="selectedDocument"
          :items="documentOptions"
          item-title="label"
          item-value="id"
          label="Документ"
          density="compact"
          variant="outlined"
          :loading="documentsLoading"
          :disabled="documentsLoading || editable || saving"
          :no-data-text="documentsLoading ? 'Загрузка документов…' : 'Документы не найдены'"
          hide-details
          @update:model-value="selectDocument"
        />
        <p v-if="apiDocument" class="mt-2 text-sm">
          Загружен: {{ apiDocument.title }} ({{ workspaceSlug }} / {{ activeDocument }})
        </p>
        <p v-if="documentsError || apiError" role="alert" class="mt-2 text-sm text-error">
          {{ documentsError || apiError }}
        </p>
        <p v-if="apiSuccess" role="status" class="mt-2 text-sm">{{ apiSuccess }}</p>
      </v-card-text>
    </v-card>

    <v-card v-if="apiDocument" class="editor-playground__card">
      <v-card-title>Редактор</v-card-title>
      <v-divider />
      <v-card-text class="pa-0">
        <EditorTipTap
          v-model="draftContent"
          v-model:fullscreen="fullscreen"
          allow-fullscreen
          :editable="editable"
          :loading="loading"
          :saving="saving"
          :workspace-slug="workspaceSlug"
          :document-slug="activeDocument"
          show-headings
          enable-anchors
          @enable-editing="enableEditing"
          @special-link-click="handleSpecialLinkClick"
          @cancel="cancelEditing"
          @save="saveContent"
        />
        <p v-if="lastSpecialLink" class="mt-3 text-xs text-secondary">
          Последняя специальная ссылка: {{ lastSpecialLink.kind }}
        </p>
      </v-card-text>
    </v-card>
    <v-card v-else-if="!loading">
      <v-card-text>Выберите документ, чтобы открыть его в редакторе.</v-card-text>
    </v-card>

    <v-card v-if="apiDocument">
      <v-card-title>HTML из v-model</v-card-title>
      <v-divider />
      <v-card-text>
        <pre class="max-h-[280px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-[rgb(var(--v-theme-background))] p-3 text-xs"><code>{{ draftContent }}</code></pre>
      </v-card-text>
    </v-card>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';

import { EditorTipTap } from '..';
import type { EditorSpecialLink } from '..';
import {
  listPlaygroundDocuments,
  loadPlaygroundDocument,
  savePlaygroundDocument,
  type PlaygroundDocument,
  type PlaygroundDocumentOption,
} from '../utils/editorDocumentApi';

const route = useRoute();
const router = useRouter();
const theme = useTheme();
const workspaceSlug = computed(() => String(route.params.workspace ?? ''));
const selectedDocument = ref<string | null>(null);
const documents = ref<PlaygroundDocumentOption[]>([]);
const documentOptions = computed(() => documents.value.map((doc) => ({
  id: doc.id,
  label: `${'— '.repeat(doc.depth)}${doc.title}`,
})));
const documentsLoading = ref(false);
const documentsLoaded = ref(false);
const documentsError = ref('');
const apiDocument = ref<PlaygroundDocument>();
const activeDocument = ref('');
const apiError = ref('');
const apiSuccess = ref('');
const draftContent = ref('');
const savedContent = ref('');
const editable = ref(false);
const fullscreen = ref(false);
const loading = ref(false);
const saving = ref(false);
const lastSpecialLink = ref<EditorSpecialLink>();
let workspaceRun = 0;
let documentRun = 0;

const clearDocument = () => {
  documentRun++;
  apiDocument.value = undefined;
  activeDocument.value = '';
  draftContent.value = '';
  savedContent.value = '';
  editable.value = false;
  loading.value = false;
  apiError.value = '';
  apiSuccess.value = '';
  lastSpecialLink.value = undefined;
};

const loadDocument = async (id: string) => {
  const run = ++documentRun;
  const workspace = workspaceSlug.value;
  apiDocument.value = undefined;
  activeDocument.value = '';
  editable.value = false;
  apiError.value = '';
  apiSuccess.value = '';
  loading.value = true;
  try {
    const loaded = await loadPlaygroundDocument(workspace, id);
    if (run !== documentRun || workspace !== workspaceSlug.value) return;
    apiDocument.value = loaded;
    activeDocument.value = id;
    savedContent.value = loaded.content;
    draftContent.value = loaded.content;
    apiSuccess.value = 'Документ загружен';
  } catch (error) {
    if (run === documentRun) {
      apiError.value = error instanceof Error ? error.message : 'Не удалось загрузить документ';
    }
  } finally {
    if (run === documentRun) loading.value = false;
  }
};

const openSelectedDocument = () => {
  const id = String(route.query.document ?? '');
  selectedDocument.value = id && documents.value.some((doc) => doc.id === id) ? id : null;
  clearDocument();
  if (selectedDocument.value) {
    void loadDocument(selectedDocument.value);
  } else if (id) {
    apiError.value = 'Документ не найден в этом пространстве';
  }
};

watch(workspaceSlug, async (workspace) => {
  const run = ++workspaceRun;
  documents.value = [];
  documentsLoaded.value = false;
  documentsLoading.value = true;
  documentsError.value = '';
  selectedDocument.value = null;
  clearDocument();
  try {
    const options = await listPlaygroundDocuments(workspace);
    if (run !== workspaceRun) return;
    documents.value = options;
    documentsLoaded.value = true;
    openSelectedDocument();
  } catch (error) {
    if (run === workspaceRun) {
      documentsError.value = error instanceof Error ? error.message : 'Не удалось загрузить список документов';
    }
  } finally {
    if (run === workspaceRun) documentsLoading.value = false;
  }
}, { immediate: true });

watch(() => route.query.document, () => {
  if (documentsLoaded.value) openSelectedDocument();
});

watch(() => route.query.theme, (value) => {
  if (value === 'light' || value === 'dark') theme.global.name.value = value;
}, { immediate: true });

const selectDocument = (id: string | null) => {
  void router.replace({
    name: 'editor-playground',
    params: { workspace: workspaceSlug.value },
    query: { ...route.query, document: id || undefined },
  });
};

const enableEditing = () => {
  draftContent.value = savedContent.value;
  editable.value = true;
};

const saveContent = async () => {
  if (!apiDocument.value || saving.value) return;
  const run = documentRun;
  const workspace = workspaceSlug.value;
  const document = activeDocument.value;
  const title = apiDocument.value.title;
  saving.value = true;
  apiError.value = '';
  apiSuccess.value = '';
  try {
    await savePlaygroundDocument(workspace, document, title, draftContent.value);
    const loaded = await loadPlaygroundDocument(workspace, document);
    if (run !== documentRun || workspace !== workspaceSlug.value) return;
    apiDocument.value = loaded;
    savedContent.value = loaded.content;
    draftContent.value = loaded.content;
    editable.value = false;
    apiSuccess.value = 'Документ сохранён и повторно загружен';
  } catch (error) {
    if (run === documentRun) {
      apiError.value = error instanceof Error ? error.message : 'Не удалось сохранить документ';
    }
  } finally {
    saving.value = false;
  }
};

const cancelEditing = () => {
  draftContent.value = savedContent.value;
  editable.value = false;
};

const handleSpecialLinkClick = (link: EditorSpecialLink) => {
  lastSpecialLink.value = link;
};
</script>

<style scoped>
.editor-playground__card {
  overflow: visible;
}
</style>
