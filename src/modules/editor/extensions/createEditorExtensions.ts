import type { AnyExtension, Extensions } from '@tiptap/core';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import { EditorDate } from './EditorDate';
import { EditorHeading } from './EditorHeading';
import { EditorFontSize } from './EditorFontSize';
import { EditorDrawio } from './EditorDrawio';
import { EditorDocumentOutline } from './EditorDocumentOutline';
import { EditorCodeBlock } from './EditorCodeBlock';
import { EditorImage } from './EditorImage';
import { EditorIndent } from './EditorIndent';
import { EditorKeyboard } from './EditorKeyboard';
import { EditorListMarker } from './EditorListMarker';
import { EditorUnderline } from './EditorUnderline';
import { EditorLegacyAnchor } from './EditorLegacyAnchor';
import { HeadingWithAnchor } from './EditorHeadingAnchor';
import { EditorMermaidBlock } from './EditorMermaidBlock';
import { EditorPaste } from './EditorPaste';
import { EditorInfoBlock } from './EditorInfoBlock';
import { EditorSpoiler } from './EditorSpoiler';
import { EditorSpecialLinks } from './EditorSpecialLinks';
import {
  EditorTable,
  EditorTableCell,
  EditorTableHeader,
  EditorTableRow,
} from './EditorTable';

interface CreateEditorExtensionsOptions {
  allowImages: boolean;
  enableAnchors?: boolean;
  mention?: AnyExtension;
  placeholder: string;
}

export const createEditorExtensions = ({
  allowImages,
  enableAnchors,
  mention,
  placeholder,
}: CreateEditorExtensionsOptions): Extensions => {
  const extensions: Extensions = [
    StarterKit.configure({
      codeBlock: false,
      heading: false,
      underline: false,
      trailingNode: false,
      link: {
        openOnClick: 'whenNotEditable',
      },
    }),
    EditorHeading,
    TextStyle,
    EditorMermaidBlock,
    EditorCodeBlock,
    Color,
    FontFamily,
    FontSize,
    EditorFontSize,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { 'data-type': 'taskItem' },
    }),
    EditorIndent,
    EditorKeyboard,
    EditorListMarker,
    EditorUnderline,
    EditorPaste.configure({ allowImages }),
    EditorDate,
    EditorDocumentOutline,
    EditorInfoBlock,
    EditorSpoiler,
    ...EditorSpecialLinks,
    EditorTable,
    EditorTableRow,
    EditorTableCell,
    EditorTableHeader,
    Subscript,
    Superscript,
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
    }),
  ];

  if (enableAnchors) extensions.push(HeadingWithAnchor, EditorLegacyAnchor);

  extensions.push(
    allowImages
      ? EditorImage
      : EditorImage.extend({
          addProseMirrorPlugins: () => [],
          addCommands: () => ({ setImage: () => () => false }),
        }),
    EditorDrawio,
  );
  if (mention) extensions.push(mention);

  return extensions;
};
