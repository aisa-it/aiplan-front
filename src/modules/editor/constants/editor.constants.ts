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

export const EDITOR_HEADING_OPTIONS: Array<
  EditorSelectOption<Level | 0>
> = [
  { title: 'Абзац', value: 0 },
  { title: 'Заголовок 1', value: 1 },
  { title: 'Заголовок 2', value: 2 },
  { title: 'Заголовок 3', value: 3 },
  { title: 'Заголовок 4', value: 4 },
  { title: 'Заголовок 5', value: 5 },
  { title: 'Заголовок 6', value: 6 },
];

export const EDITOR_ALIGNMENT_OPTIONS: EditorAlignmentOption[] = [
  {
    value: 'left',
    icon: 'align-left',
    tooltip: 'Выровнять по левому краю',
  },
  {
    value: 'center',
    icon: 'align-center',
    tooltip: 'Выровнять по центру',
  },
  {
    value: 'right',
    icon: 'align-right',
    tooltip: 'Выровнять по правому краю',
  },
  {
    value: 'justify',
    icon: 'align-justify',
    tooltip: 'Выровнять по ширине',
  },
];

export const EDITOR_TEXT_COLORS: EditorColorOption[] = [
  { light: '#474A52', dark: '#BAC4D5', label: 'Стандартный' },
  { light: '#3F76FF', dark: '#7EA2FC', label: 'Синий' },
  { light: '#1DABB8', dark: '#42D4E1', label: 'Бирюзовый' },
  { light: '#43A047', dark: '#7CB342', label: 'Зелёный' },
  { light: '#DC3E3E', dark: '#FF7A7A', label: 'Красный' },
  { light: '#FF8B00', dark: '#FFAB00', label: 'Оранжевый' },
  { light: '#E7AF41', dark: '#EFC980', label: 'Жёлтый' },
  { light: '#DF49A7', dark: '#FA99D6', label: 'Розовый' },
  { light: '#582EFF', dark: '#BA88FC', label: 'Фиолетовый' },
  { light: '#795548', dark: '#BCAAA4', label: 'Коричневый' },
  { light: '#000000', dark: '#FFFFFF', label: 'Монохромный' },
];

export const EDITOR_HIGHLIGHT_COLORS: EditorColorOption[] = [
  { light: '#E1F5FE', dark: '#052C48', label: 'Синий' },
  { light: '#DCF7F9', dark: '#0C4246', label: 'Бирюзовый' },
  { light: '#E8F5E9', dark: '#17351A', label: 'Зелёный' },
  { light: '#FCE4EC', dark: '#47000B', label: 'Красный' },
  { light: '#FFE4CC', dark: '#522C00', label: 'Оранжевый' },
  { light: '#FFF1E1', dark: '#524400', label: 'Жёлтый' },
  { light: '#FEDCF2', dark: '#530436', label: 'Розовый' },
];

export const EDITOR_TABLE_CELL_COLORS = [
  { value: 'red', light: '#FCE4EC', dark: '#47000B', label: 'Красный' },
  { value: 'blue', light: '#E1F5FE', dark: '#052C48', label: 'Синий' },
  { value: 'cyan', light: '#DCF7F9', dark: '#0C4246', label: 'Бирюзовый' },
  { value: 'green', light: '#E8F5E9', dark: '#17351A', label: 'Зелёный' },
  { value: 'orange', light: '#FFE4CC', dark: '#522C00', label: 'Оранжевый' },
  { value: 'yellow', light: '#FFF1E1', dark: '#524400', label: 'Жёлтый' },
  { value: 'pink', light: '#FEDCF2', dark: '#530436', label: 'Розовый' },
] as const;
