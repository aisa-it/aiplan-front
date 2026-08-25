import { EXTENSION_AUDIO } from 'src/constants/constants';

// Форматы, для которых у вложения показывается кнопка «Предпросмотр».
// Каждый формат отсюда обязан попадать в одну из веток DocPreviewDialog
// (EXTENSION_VIDEO / EXTENSION_AUDIO / EXTENSION_DOCUMENT / EXTENSION_IFRAME),
// иначе файл уедет в ветку изображения и превью сломается.
export const ATTACHMENT_SUPPORTED_FORMATS = [
  'pdf',
  'png',
  'jpeg',
  'jpg',
  'gif',
  'mp4',
  'mov',
  'wmv',
  'webm',
  'mkv',
  ...EXTENSION_AUDIO,
];
