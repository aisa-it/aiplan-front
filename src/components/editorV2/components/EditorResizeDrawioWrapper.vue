<template>
  <NodeViewWrapper class="drawio-wrapper">
    <img
      :src="node.attrs.src"
      :class="{ drawio: true, zoom: isReadOnly }"
      :draggable="node.attrs.draggable"
      :data-asset="node.attrs.src"
      :data-drawio="true"
      @dblclick="handleClick"
    />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, computed, inject, onUnmounted } from 'vue';
import { NodeViewRendererProps, NodeViewWrapper } from '@tiptap/vue-3';

const props = defineProps<NodeViewRendererProps>();

const injectedReadOnly = inject('isEditorReadOnly', ref(false));
const isReadOnly = computed(() => {
  return injectedReadOnly.value || !props.editor?.isEditable;
});

const handleClick = (event: MouseEvent) => {
  if (!isReadOnly.value) openDrawioEditor(event.target as EventTarget);
};

const urlToBase64 = async (
  url: string,
): Promise<string | ArrayBuffer | null> => {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const openDrawioEditor = (source: EventTarget) => {
  const dialog = document.createElement('dialog');
  dialog.style.border = '0';
  dialog.style.padding = '0';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('frameborder', '0');

  iframe.setAttribute('src', props.extension.options.drawIoLink);
  iframe.style.width = props.extension.options.width;
  iframe.style.height = props.extension.options.height;

  dialog.appendChild(iframe);
  document.body.appendChild(dialog);
  dialog.showModal();

  const receive = async (event: MessageEvent<any>) => {
    if (!event.data) return;
    let msg;
    if (typeof event.data === 'string') {
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }
    } else {
      msg = event.data;
    }
    let xmlData = null;
    switch (msg.event) {
      case 'init':
        xmlData = props.node.attrs.xml;

        if (xmlData) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              action: 'load',
              xml: xmlData,
            }),
            '*',
          );
        } else {
          const src = source.getAttribute('src');
          let base64: string | ArrayBuffer = src ?? '';

          if (src && !src.startsWith('data:')) {
            base64 = (await urlToBase64(src)) ?? '';
          }

          iframe.contentWindow?.postMessage(
            JSON.stringify({
              action: 'load',
              xmlpng: base64,
            }),
            '*',
          );
        }
        break;

      case 'save':
        iframe.contentWindow?.postMessage(
          JSON.stringify({
            action: 'export',
            format: 'xmlsvg',
            spinKey: 'saving',
          }),
          '*',
        );
        break;

      case 'export':
        let svgData = msg.data;
        xmlData = msg.xml;

        if (svgData.startsWith('data:image/svg+xml;base64,')) {
          const base64Data = svgData.substring(
            'data:image/svg+xml;base64,'.length,
          );
          const svgText = atob(base64Data);
          const correctedSvgText = svgText.replace(
            /color-scheme:\s*light\s+dark/g,
            'color-scheme: light',
          );
          const correctedBase64 = btoa(correctedSvgText);
          svgData = 'data:image/svg+xml;base64,' + correctedBase64;
        }

        props.updateAttributes({
          src: svgData,
          xml: xmlData,
        });
        break;

      case 'exit':
        window.removeEventListener('message', receive);
        dialog.close();
        dialog.remove();
        break;
    }
  };

  window.addEventListener('message', receive);

  const cleanup = () => {
    window.removeEventListener('message', receive);
    if (document.body.contains(dialog)) {
      dialog.close();
      dialog.remove();
    }
  };

  onUnmounted(cleanup);
};
</script>

<style scoped>
.drawio-wrapper {
  display: inline-block;
}

.drawio {
  cursor: pointer;

  &.zoom {
    cursor: zoom-in;
  }
}
</style>
