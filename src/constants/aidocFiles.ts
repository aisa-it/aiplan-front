export const AIDOC_ACCEPTABLE_FORMATS_DOCS = [
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'pdf',
  'txt',
  'rtf',
  'odt',
  'ods',
  'odp',
];
export const AIDOC_ACCEPTABLE_FORMATS_IMAGES = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'svg',
  'bmp',
  'tiff',
  'tif',
];
export const AIDOC_ACCEPTABLE_FORMATS_ARCHIVES = ['zip', 'rar', '7z'];
export const AIDOC_ACCEPTABLE_FORMATS_AUDIO = ['mp3', 'wav', 'ogg'];
export const AIDOC_ACCEPTABLE_FORMATS_VIDEO = ['mp4', 'avi', 'mov', 'mkv'];
export const AIDOC_ACCEPTABLE_FORMATS_OTHER = [
  'csv',
  'html',
  'htm',
  'json',
  'xml',
];
export const AIDOC_ACCEPTABLE_FILE_FORMATS = [
  ...AIDOC_ACCEPTABLE_FORMATS_DOCS,
  ...AIDOC_ACCEPTABLE_FORMATS_IMAGES,
  ...AIDOC_ACCEPTABLE_FORMATS_ARCHIVES,
  ...AIDOC_ACCEPTABLE_FORMATS_VIDEO,
  ...AIDOC_ACCEPTABLE_FORMATS_AUDIO,
  ...AIDOC_ACCEPTABLE_FORMATS_OTHER,
];

export const AIDOC_ACCEPT_FILE_TYPES_STRING = AIDOC_ACCEPTABLE_FILE_FORMATS.map(
  (ext) => `.${ext}`,
).join(',');

export const MAX_SIZE_FILE_VALUE = 4;
export const MAX_SIZE_FILE_UNIT = 'гб';
export const MAX_SIZE_FILE = 4 * 1024 * 1024 * 1024; // 4гб
