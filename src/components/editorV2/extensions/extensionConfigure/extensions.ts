import StarterKit from '@tiptap/starter-kit';
import {Table} from '@tiptap/extension-table';
import { Color } from '@tiptap/extension-color';
import TableRow from '@tiptap/extension-table-row';
import TaskList from '@tiptap/extension-task-list';
import TableCell from '@tiptap/extension-table-cell';
import {TextStyle} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize } from 'tiptap-extension-font-size';
import FontFamily from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import TableHeader from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { DateNode } from 'src/utils/dateEditor';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  getHierarchicalIndexes,
  TableOfContents,
} from '@tiptap/extension-table-of-contents';
import { Spoiler } from 'src/utils/spoiler';
import { InfoBlock } from 'src/utils/infoBlock';
import {
  IndentExtend,
  TaskItemExtend,
  ListItemExtend,
  CustomUnderline,
  CustomKeyboardBehaviour,
  StopPageScrollExtension,
  CodeBlockLowlightExtend,
  DisableImagesExtension,
  useEditorMarks,
  CustomImagePlugin,
  CustomLink,
  DrawIoExtension,
} from 'src/components/editorV2/utils/tiptap';
import { useMention } from './customMention';
import { CommentLinkMention } from 'src/utils/commentLinkEditor';
import { IssueLinkMention } from 'src/utils/issueLinkEditor';
import { AttachmentLinkMention } from 'src/utils/attachmentLinkMention';
import { TableOfContentsCustom } from 'src/utils/tableOfContents';
import drawioBaseImage from 'src/components/icons/drawio/start.drawio.png';

export const getEditorExtensions = (props) => {
  const { mention } = useMention(props.getMembersForMention);
  const { FormatSample } = useEditorMarks();
  const extensions = [
    Color,
    FontSize,
    TableRow,
    TaskList,
    TextStyle,
    FontFamily,
    Spoiler,
    InfoBlock,
    Superscript,
    Subscript,
    FormatSample,
    TaskItemExtend,
    DateNode,
    CustomLink.configure({
      openOnClick: false,
    }),
    ListItemExtend,
    CustomUnderline,
    CustomKeyboardBehaviour,
    StopPageScrollExtension,
    Highlight.configure({ multicolor: true }),
    Table.configure({
      resizable: true,
      cellMinWidth: 25,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    IndentExtend.configure({
      types: ['paragraph', 'heading'],
    }),
    Placeholder.configure({
      placeholder: props.editorPlaceholder,
      showOnlyWhenEditable: true,
    }),
    TableCell.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          'data-bgcolor': {
            default: null,
            parseHTML: (element) => {
              return element.getAttribute('data-bgcolor') || null;
            },
            renderHTML: (attributes) => {
              if (!attributes['data-bgcolor']) return {};
              return {
                'data-bgcolor': attributes['data-bgcolor'],
              };
            },
          },
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor} !important;`,
              };
            },
          },
        };
      },
    }),
    TableHeader.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          'data-bgcolor': {
            default: null,
            parseHTML: (element) =>
              element.getAttribute('data-bgcolor') || null,
            renderHTML: (attributes) => {
              if (!attributes['data-bgcolor']) return {};
              return {
                'data-bgcolor': attributes['data-bgcolor'],
                style: `background-color: ${attributes['data-bgcolor']}`,
              };
            },
          },
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor} !important;`,
              };
            },
          },
        };
      },
    }),
    DrawIoExtension.configure({
      openDialog: props.isReadOnly ? undefined : 'dblclick',
      baseImage: drawioBaseImage,
    }),
  ];

  if (props.isMention) {
    extensions.push(mention);
  }
  extensions.push(AttachmentLinkMention);
  extensions.push(IssueLinkMention);
  extensions.push(CommentLinkMention);

  if (props.isCodeBlockLowlight) {
    extensions.push(
      StarterKit.configure({
        codeBlock: false,
        listItem: false,
      }),
    );
    extensions.push(
      CodeBlockLowlightExtend.configure({
        isCodeSelect: false,
      }),
    );
  } else {
    extensions.push(
      StarterKit.configure({
        listItem: false,
      }),
    );
  }

  if (!props.disableImages) {
    extensions.push(
      CustomImagePlugin.configure({
        inline: true,
        allowBase64: true,
      }),
    );
  } 
  // else {
    // TODO: расширение блокировало вставку текста с переносами, потом разобраться
    // extensions.push(DisableImagesExtension);
  // }

  if (props.showHeadings) {
    extensions.push(
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate: (value) => {
          return value;
        },
      }),
      TableOfContentsCustom,
    );
  }

  return extensions;
};
