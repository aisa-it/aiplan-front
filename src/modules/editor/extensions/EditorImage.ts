import { i18n } from '@/i18n';
import { Image } from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import { toast } from '@/modules/toast/toast';
import EditorImageNodeView from '../components/EditorImageNodeView.vue';
import { insertAsyncEditorContent } from '../utils/insertAsyncEditorContent';
import type { Editor, JSONContent } from '@tiptap/core';

const UNSUPPORTED_IMAGE_FORMATS = new Set(['heic', 'tif', 'tiff']);
export const getImageFormatError = () =>
  i18n.global.t('editor.thisFileFormatIsNotSupported');

const getImageFormat = (file: File) => file.type.split('/')[1]?.toLowerCase();

export const isSupportedImageFile = (file: File) =>
  file.type.startsWith('image/') &&
  !UNSUPPORTED_IMAGE_FORMATS.has(getImageFormat(file) ?? '');

export const readImageFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read image'));
    });
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });

const localizePastedImageHtml = async (html: string) => {
  const pasted = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(pasted.querySelectorAll('img[src]'));
  await Promise.all(
    images.map(async (image) => {
      const src = image.getAttribute('src');
      if (!src || !/^https?:\/\//i.test(src)) return;
      try {
        const response = await fetch(src);
        if (!response.ok) return;
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) return;
        image.setAttribute(
          'src',
          await readImageFile(new File([blob], 'image', { type: blob.type })),
        );
      } catch {}
    }),
  );
  return pasted.body.innerHTML;
};

const getImageAttributes = async (file: File) => ({
  src: await readImageFile(file),
  alt: file.name.replace(/\.[^/.]+$/, ''),
});

export const insertImageFiles = (
  editor: Editor,
  files: File[],
  position?: number,
) =>
  insertAsyncEditorContent(
    editor,
    async () => {
      const content: JSONContent[] = [];
      for (const file of files) {
        if (!isSupportedImageFile(file)) {
          toast.error(getImageFormatError());
          continue;
        }
        try {
          content.push({
            type: 'image',
            attrs: await getImageAttributes(file),
          });
        } catch {
          if (!editor.isDestroyed && editor.isEditable) toast.error();
        }
      }
      return content;
    },
    position,
  );

export const EditorImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      style: {
        default: 'height: auto;',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('style') || 'height: auto;',
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorImageNodeView);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('editorImageFiles'),
        props: {
          handleDrop: (view, event) => {
            if (!view.editable) return false;
            const files = Array.from(event.dataTransfer?.files ?? []).filter(
              (file) => file.type.startsWith('image/'),
            );

            if (!files.length) return false;

            event.preventDefault();

            const position = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })?.pos;

            if (position === undefined) return true;

            void insertImageFiles(this.editor, files, position);

            return true;
          },
          handlePaste: (view, event) => {
            if (
              !view.editable ||
              view.state.selection.$from.parent.type.spec.code
            )
              return false;
            const html = event.clipboardData?.getData('text/html') ?? '';
            if (/<table(?:\s|>)/i.test(html)) return false;
            const files = Array.from(event.clipboardData?.files ?? []).filter(
              (file) => file.type.startsWith('image/'),
            );
            const pasted = html
              ? new DOMParser().parseFromString(html, 'text/html')
              : undefined;
            const images = Array.from(
              pasted?.querySelectorAll('img[src]') ?? [],
            );

            if (files.length) {
              event.preventDefault();
              void insertImageFiles(this.editor, files);
              return true;
            }

            if (html) {
              const hasRemoteImage = images.some((image) =>
                /^https?:\/\//i.test(image.getAttribute('src') ?? ''),
              );
              if (hasRemoteImage) {
                event.preventDefault();
                void insertAsyncEditorContent(this.editor, () =>
                  localizePastedImageHtml(html),
                );
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
}).configure({
  inline: true,
  allowBase64: true,
});
