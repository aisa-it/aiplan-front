<template>
  <v-dialog :model-value="true" fullscreen persistent>
    <v-card>
      <v-toolbar density="compact">
        <v-toolbar-title>{{ t('editor.diagramEditor') }}</v-toolbar-title>
        <v-btn icon="mdi-close" :aria-label="t('editor.closeDiagramEditor')" :disabled="exporting" @click="confirmClose = true" />
      </v-toolbar>
      <p v-if="error" role="alert" class="pa-4 text-error">{{ error }}</p>
      <iframe ref="frame" :src="url" title="Draw.io" class="editor-drawio-frame" />
    </v-card>
  </v-dialog>
  <v-dialog v-model="confirmClose" max-width="420">
    <v-card :title="t('editor.confirmCloseDiagramEditor')">
      <v-card-text>{{ t('editor.unsavedChangesWillBeLost') }}</v-card-text>
      <v-card-actions>
        <v-btn @click="confirmClose = false">{{ t('editor.continueEditing') }}</v-btn>
        <v-btn color="error" @click="emit('close')">{{ t('editor.closeWithoutSaving') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { onBeforeUnmount, onMounted, ref } from 'vue';
import { forceLightDrawioSvg } from '../utils/forceLightDrawioSvg';

const { t } = useI18n();

const props = defineProps<{ xml: string; src: string }>();
const emit = defineEmits<{
  close: [];
  save: [value: { src: string; xml: string }];
}>();
const origin = 'https://embed.diagrams.net';
const url = `${origin}/?embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json`;
const frame = ref<HTMLIFrameElement>();
const error = ref('');
const confirmClose = ref(false);
const controller = new AbortController();
let savedXml = props.xml;
const exporting = ref(false);
const send = (message: Record<string, unknown>) =>
  frame.value?.contentWindow?.postMessage(JSON.stringify(message), origin);

const receive = async (event: MessageEvent) => {
  if (event.origin !== origin || event.source !== frame.value?.contentWindow) return;
  let message;
  try { message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; }
  catch { return; }
  if (!message || typeof message !== 'object') return;
  if (message.event === 'init') {
    try {
      if (props.xml) send({ action: 'load', xml: props.xml });
      else {
        let data = props.src;
        if (!data.startsWith('data:')) {
          const response = await fetch(data, { signal: controller.signal });
          if (!response.ok) throw new Error('Image unavailable');
          const blob = await response.blob();
          data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
        if (!controller.signal.aborted) send({ action: 'load', xmlpng: data });
      }
    } catch {
      if (!controller.signal.aborted) error.value = t('editor.couldNotLoadTheDiagram');
    }
  } else if (message.event === 'save' && typeof message.xml === 'string') {
    savedXml = message.xml;
    exporting.value = true;
    send({ action: 'export', format: 'xmlsvg', xml: savedXml, spinKey: 'saving' });
  } else if (message.event === 'export' && exporting.value) {
    exporting.value = false;
    if (typeof message.data !== 'string' || !message.data.startsWith('data:image/svg+xml;base64,')) {
      error.value = t('editor.couldNotSaveTheDiagramImage');
      send({ action: 'spinner', show: false });
      return;
    }
    emit('save', { src: forceLightDrawioSvg(message.data), xml: savedXml });
    send({ action: 'status', modified: false });
    send({ action: 'spinner', show: false });
  } else if (message.event === 'exit') emit('close');
};
onMounted(() => window.addEventListener('message', receive));
onBeforeUnmount(() => {
  controller.abort();
  window.removeEventListener('message', receive);
});
</script>

<style scoped>
.editor-drawio-frame { flex: 1; width: 100%; border: 0; min-height: 0; }
</style>
