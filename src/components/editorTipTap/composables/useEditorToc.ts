import { type Ref, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { TextSelection } from '@tiptap/pm/state';

export interface TocLink {
  id: string;
  text: string;
  index: string | number;
  originalLevel: number;
}

const generateHeadingLinks = (items: any[] = []): TocLink[] =>
  (items || []).map((item: any, index: number) => ({
    id: item.id ?? String(index),
    text: item.textContent ?? item.text ?? '',
    index: item.itemIndex ?? index + 1,
    originalLevel: item.originalLevel ?? item.level ?? 1,
  }));

export const hasOwnNumeration = (heading: string) => /\d/.test(heading[0]);

export function useEditorToc(
  editorInstance: Ref<Editor | null>,
  showHeadings: Ref<boolean> | { value: boolean },
) {
  const tocLinks = ref<TocLink[]>([]);
  const isTocPopupOpen = ref(false);

  const refreshTocLinks = () => {
    if (!showHeadings.value || !editorInstance.value) {
      tocLinks.value = [];
      return;
    }

    const items =
      editorInstance.value.extensionStorage?.tableOfContents?.content || [];
    tocLinks.value = generateHeadingLinks(items);
  };

  const onTocItemClick = (link: TocLink) => {
    if (!editorInstance.value) return;
    const editor = editorInstance.value;
    const element = editor.view.dom.querySelector(`[data-toc-id="${link.id}"]`);
    if (!element) return;

    try {
      const pos = editor.view.posAtDOM(element, 0);
      const tr = editor.view.state.tr;
      tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
      editor.view.dispatch(tr);
      editor.view.focus();
    } catch {
      // ignore
    }

    isTocPopupOpen.value = false;
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - 60,
      behavior: 'smooth',
    });
  };

  const updateToC = () => {
    if (!editorInstance.value) return;
    const { state } = editorInstance.value;
    const { tr, doc } = state;

    doc.descendants((node, pos) => {
      if (node.type.name !== 'heading-links') return;
      const newNode = node.type.create(
        {
          ...node.attrs,
          links: generateHeadingLinks(
            editorInstance.value!.extensionStorage.tableOfContents.content,
          ),
        },
        node.content,
        node.marks,
      );
      if (newNode?.type) {
        tr.replaceRangeWith(pos, pos + node.nodeSize, newNode);
      }
    });

    if (tr.docChanged) editorInstance.value.view.dispatch(tr);
  };

  return {
    tocLinks,
    isTocPopupOpen,
    refreshTocLinks,
    onTocItemClick,
    updateToC,
  };
}
