import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type Ref,
} from 'vue';
import { useTheme } from 'vuetify';
import { Editor } from '@tiptap/vue-3';
import { getEditorExtensions } from '../extensions/extensionConfigure/extensions';
import { getEditorProps, useHandleMouseUp, replaceColor } from '../utils/editorUtils';

interface EditorInstanceProps {
  modelValue: string;
  classPrevent?: string;
  [key: string]: unknown;
}

export function useEditorInstance(options: {
  props: EditorInstanceProps;
  isReadOnly: Ref<boolean>;
  isFormatSampleActive: Ref<boolean>;
  onCommentLink: (data: any) => void;
  onEditorChange?: () => void;
  emitUpdate: (html: string) => void;
  emitDom: (doc: unknown) => void;
  emitEditor: (editor: Editor | null) => void;
}) {
  const theme = useTheme();
  const editorInstance = shallowRef<Editor | null>(null);
  const editorExtensions = computed(() => getEditorExtensions(options.props));

  const normalizeContent = (value: string) =>
    value.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;');

  const notifyChange = () => {
    options.onEditorChange?.();
  };

  const createEditor = () => {
    editorInstance.value?.destroy();

    editorInstance.value = new Editor({
      content: normalizeContent(options.props.modelValue),
      editable: !options.isReadOnly.value,
      extensions: editorExtensions.value as any,
      onUpdate: () => {
        options.emitUpdate(editorInstance.value?.getHTML() ?? '');
        options.emitDom(editorInstance.value?.state.doc);
        notifyChange();
      },
      onCreate: () => {
        options.emitDom(editorInstance.value?.state.doc);
        notifyChange();
      },
      editorProps: getEditorProps(editorInstance, options.onCommentLink),
    });

    const { addMouseUpListener } = useHandleMouseUp(
      editorInstance as any,
      options.isFormatSampleActive,
    );
    addMouseUpListener();
    options.emitEditor(editorInstance.value);
  };

  watch(
    () => options.isReadOnly.value,
    (isReadOnly, wasReadOnly) => {
      if (!editorInstance.value) return;
      if (wasReadOnly && !isReadOnly) {
        const scrollY = window.scrollY;
        editorInstance.value.setOptions({ editable: true });
        nextTick(() => window.scrollTo({ top: scrollY }));
        return;
      }
      editorInstance.value.setOptions({ editable: !isReadOnly });
    },
  );

  watch(
    () => options.props.modelValue,
    (value) => {
      const nextValue = normalizeContent(value);
      if (!editorInstance.value || nextValue === editorInstance.value.getHTML()) {
        return;
      }
      const mode = theme.global.current.value.dark ? 'dark' : 'light';
      editorInstance.value.commands.setContent(replaceColor(nextValue, mode), {
        emitUpdate: false,
      });
      notifyChange();
    },
  );

  onMounted(createEditor);

  onBeforeUnmount(() => {
    editorInstance.value?.destroy();
  });

  return { editorInstance };
}
