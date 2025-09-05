import FileIcon from 'src/components/icons/FileIcon.vue';
import FileCodeIcon from 'src/components/icons/FileCodeIcon.vue';
import FilePdfIcon from 'src/components/icons/FilePdfIcon.vue';
import FilePictureIcon from 'src/components/icons/FilePictureIcon.vue';
import FileZIPIcon from 'src/components/icons/FileZIPIcon.vue';
import FIleTableIcon from 'src/components/icons/FIleTableIcon.vue';
import FileMediaIcon from 'src/components/icons/FileMediaIcon.vue';

const components = {
  doc: FileIcon,
  docx: FileIcon,
  xls: FIleTableIcon,
  xlsx: FIleTableIcon,
  png: FilePictureIcon,
  jpeg: FilePictureIcon,
  jpg: FilePictureIcon,
  pdf: FilePdfIcon,
  js: FileCodeIcon,
  css: FileCodeIcon,
  html: FileCodeIcon,
  mp4: FileMediaIcon,
  avi: FileMediaIcon,
  mp3: FileMediaIcon,
  go: FileCodeIcon, // Go
  java: FileCodeIcon, // Java
  py: FileCodeIcon, // Python
  rb: FileCodeIcon, // Ruby
  php: FileCodeIcon, // PHP
  c: FileCodeIcon, // C
  cpp: FileCodeIcon, // C++
  ts: FileCodeIcon, // TypeScript
  jsx: FileCodeIcon, // JSX
  vue: FileCodeIcon, // Vue.js
  dart: FileCodeIcon, // Dart
  swift: FileCodeIcon, // Swift
  kotlin: FileCodeIcon, // Kotlin
  sql: FileCodeIcon, // SQL
  json: FileCodeIcon, // JSON
  yaml: FileCodeIcon, // YAML
  xml: FileCodeIcon, // XML
  md: FileCodeIcon, // Markdown
  txt: FileCodeIcon, // Text (often used for notes, etc.)
  bat: FileCodeIcon, // Batch file
  sh: FileCodeIcon, // Shell script
  lua: FileCodeIcon, // Lua
  exe: FileCodeIcon, // Executable file
  dmg: FileCodeIcon, // Mac disk image
  iso: FileCodeIcon, // ISO image
  psd: FilePictureIcon, // Photoshop file
  ai: FilePictureIcon, // Adobe Illustrator file
  eps: FilePictureIcon, // EPS image file
  tiff: FilePictureIcon, // TIFF image
  webp: FilePictureIcon, // WebP image
  svg: FilePictureIcon, // SVG vector image
  bmp: FilePictureIcon, // BMP image
  tif: FilePictureIcon, // TIFF image
  flv: FileMediaIcon, // Flash Video
  mov: FileMediaIcon, // Quicktime Movie
  mkv: FileMediaIcon, // Matroska video
  wmv: FileMediaIcon, // Windows Media Video
  '3gp': FileMediaIcon, // 3GP video
  mp2: FileMediaIcon, // MP2 audio
  m4a: FileMediaIcon, // M4A audio
  wav: FileMediaIcon, // WAV audio
  ogg: FileMediaIcon, // OGG audio
  aiff: FileMediaIcon, // AIFF audio
  opus: FileMediaIcon, // Opus audio
  ac3: FileMediaIcon, // AC3 audio
  alac: FileMediaIcon, // ALAC audio
  flac: FileMediaIcon, // FLAC audio
  zip: FileZIPIcon, // Zip archive
  rar: FileZIPIcon, // RAR archive
  tar: FileZIPIcon, // TAR archive
  gz: FileZIPIcon, // GZ archive
  bz2: FileZIPIcon, // BZ2 archive
  '7z': FileZIPIcon, // 7z archive
  apk: FileCodeIcon, // Android package
  jar: FileCodeIcon, // Java archive
  msi: FileCodeIcon, // Microsoft installer
  dat: FileCodeIcon, // Data file
  cfg: FileCodeIcon, // Configuration file
  log: FileCodeIcon, // Log file
  bak: FileCodeIcon, // Backup file
};

export function getIconFormat(format: string) {
  return components[format as keyof typeof components];
}
