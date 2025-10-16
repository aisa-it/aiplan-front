import { Editor } from '@tiptap/vue-3';
import { Ref, watch } from 'vue';

export function useAttachmentsWithEditor(
  editor: Ref<Editor | undefined>,
  uploadAttachment: (file: File) => Promise<any>,
  getAttachments: () => Promise<any>,
  refresh: () => void,
) {
  const uploadFile = async (file: File) => {
    await uploadAttachment(file);

    const attachments = await getAttachments();

    const uploaded = attachments.find((a: any) => a.asset?.name === file.name);

    return {
      id: uploaded?.asset?.id,
      name: uploaded?.asset?.name,
      url: `${window.location.origin}/uploads/${uploaded?.asset?.id}`,
    };
  };

  const handleDrop = async (event: DragEvent) => {
    if (!event.dataTransfer?.files?.length) return;

    const file = event.dataTransfer.files[0];

    const cursorPosition =
      editor.value?.view?.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })?.pos ?? 0;

    const loadText = `Загрузка ${file.name}...`;

    editor.value
      ?.chain()
      .focus()
      .insertContentAt(cursorPosition, loadText)
      .run();

    try {
      const uploaded = await uploadFile(file);

      editor.value
        ?.chain()
        .focus()
        .deleteRange({
          from: cursorPosition,
          to: cursorPosition + loadText.length + 1,
        })
        .insertContentAt(
          cursorPosition,
          `<a href="${uploaded.url}" target="_blank">${uploaded.name}</a>`,
        )
        .run();

      refresh();
    } catch (err) {
      editor.value
        ?.chain()
        .focus()
        .insertContentAt(cursorPosition, 'Ошибка загрузки файла...')
        .run();
    }
  };

  watch(editor, (newEditor) => {
    newEditor?.setOptions({
      editorProps: {
        handleDOMEvents: {
          drop: (_, event) => {
            event.preventDefault();
            return true;
          },
        },
      },
    });
  });

  return { handleDrop };
}
