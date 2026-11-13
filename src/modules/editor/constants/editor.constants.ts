import { i18n } from '@/i18n';
import type { Level } from '@tiptap/extension-heading';

import type {
  EditorAlignmentOption,
  EditorColorOption,
  EditorSelectOption,
} from '../model/editor.types';

export const DEFAULT_EDITOR_FONT_SIZE = '14px';

export const EDITOR_FONT_SIZES: Array<EditorSelectOption<string>> = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '26px',
  '28px',
  '30px',
  '32px',
  '34px',
  '36px',
].map((value) => ({ title: value, value }));

export const EDITOR_FONT_FAMILIES: Array<EditorSelectOption<string>> = [
  'sans-serif',
  'serif',
  'monospace',
].map((value) => ({ title: value, value }));

export const EDITOR_HEADING_OPTIONS: Array<EditorSelectOption<Level | 0>> = [
  {
    get title() {
      return i18n.global.t('editor.paragraph');
    },
    value: 0,
  },
  {
    get title() {
      return i18n.global.t('editor.heading1');
    },
    value: 1,
  },
  {
    get title() {
      return i18n.global.t('editor.heading2');
    },
    value: 2,
  },
  {
    get title() {
      return i18n.global.t('editor.heading3');
    },
    value: 3,
  },
  {
    get title() {
      return i18n.global.t('editor.heading4');
    },
    value: 4,
  },
  {
    get title() {
      return i18n.global.t('editor.heading5');
    },
    value: 5,
  },
  {
    get title() {
      return i18n.global.t('editor.heading6');
    },
    value: 6,
  },
];

export const EDITOR_ALIGNMENT_OPTIONS: EditorAlignmentOption[] = [
  {
    value: 'left',
    icon: 'align-left',
    get tooltip() {
      return i18n.global.t('editor.alignLeft');
    },
  },
  {
    value: 'center',
    icon: 'align-center',
    get tooltip() {
      return i18n.global.t('editor.alignCenter');
    },
  },
  {
    value: 'right',
    icon: 'align-right',
    get tooltip() {
      return i18n.global.t('editor.alignRight');
    },
  },
  {
    value: 'justify',
    icon: 'align-justify',
    get tooltip() {
      return i18n.global.t('editor.justify');
    },
  },
];

export const EDITOR_TEXT_COLORS: EditorColorOption[] = [
  {
    light: '#474A52',
    dark: '#BAC4D5',
    get label() {
      return i18n.global.t('editor.default');
    },
  },
  {
    light: '#3F76FF',
    dark: '#7EA2FC',
    get label() {
      return i18n.global.t('editor.blue');
    },
  },
  {
    light: '#1DABB8',
    dark: '#42D4E1',
    get label() {
      return i18n.global.t('editor.turquoise');
    },
  },
  {
    light: '#43A047',
    dark: '#7CB342',
    get label() {
      return i18n.global.t('editor.green');
    },
  },
  {
    light: '#DC3E3E',
    dark: '#FF7A7A',
    get label() {
      return i18n.global.t('editor.red');
    },
  },
  {
    light: '#FF8B00',
    dark: '#FFAB00',
    get label() {
      return i18n.global.t('editor.orange');
    },
  },
  {
    light: '#E7AF41',
    dark: '#EFC980',
    get label() {
      return i18n.global.t('editor.yellow');
    },
  },
  {
    light: '#DF49A7',
    dark: '#FA99D6',
    get label() {
      return i18n.global.t('editor.pink');
    },
  },
  {
    light: '#582EFF',
    dark: '#BA88FC',
    get label() {
      return i18n.global.t('editor.purple');
    },
  },
  {
    light: '#795548',
    dark: '#BCAAA4',
    get label() {
      return i18n.global.t('editor.brown');
    },
  },
  {
    light: '#000000',
    dark: '#FFFFFF',
    get label() {
      return i18n.global.t('editor.monochrome');
    },
  },
];

export const EDITOR_HIGHLIGHT_COLORS: EditorColorOption[] = [
  {
    light: '#E1F5FE',
    dark: '#052C48',
    get label() {
      return i18n.global.t('editor.blue');
    },
  },
  {
    light: '#DCF7F9',
    dark: '#0C4246',
    get label() {
      return i18n.global.t('editor.turquoise');
    },
  },
  {
    light: '#E8F5E9',
    dark: '#17351A',
    get label() {
      return i18n.global.t('editor.green');
    },
  },
  {
    light: '#FCE4EC',
    dark: '#47000B',
    get label() {
      return i18n.global.t('editor.red');
    },
  },
  {
    light: '#FFE4CC',
    dark: '#522C00',
    get label() {
      return i18n.global.t('editor.orange');
    },
  },
  {
    light: '#FFF1E1',
    dark: '#524400',
    get label() {
      return i18n.global.t('editor.yellow');
    },
  },
  {
    light: '#FEDCF2',
    dark: '#530436',
    get label() {
      return i18n.global.t('editor.pink');
    },
  },
];

export const EDITOR_TABLE_CELL_COLORS = [
  {
    value: 'red',
    light: '#FCE4EC',
    dark: '#47000B',
    get label() {
      return i18n.global.t('editor.red');
    },
  },
  {
    value: 'blue',
    light: '#E1F5FE',
    dark: '#052C48',
    get label() {
      return i18n.global.t('editor.blue');
    },
  },
  {
    value: 'cyan',
    light: '#DCF7F9',
    dark: '#0C4246',
    get label() {
      return i18n.global.t('editor.turquoise');
    },
  },
  {
    value: 'green',
    light: '#E8F5E9',
    dark: '#17351A',
    get label() {
      return i18n.global.t('editor.green');
    },
  },
  {
    value: 'orange',
    light: '#FFE4CC',
    dark: '#522C00',
    get label() {
      return i18n.global.t('editor.orange');
    },
  },
  {
    value: 'yellow',
    light: '#FFF1E1',
    dark: '#524400',
    get label() {
      return i18n.global.t('editor.yellow');
    },
  },
  {
    value: 'pink',
    light: '#FEDCF2',
    dark: '#530436',
    get label() {
      return i18n.global.t('editor.pink');
    },
  },
] as const;
