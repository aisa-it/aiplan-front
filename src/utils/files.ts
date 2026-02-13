import { IAttachmentCard } from 'src/interfaces/files';

export const getFileExtension = (
  value: IAttachmentCard,
  part: 'name' | 'extension',
): string => {
  const filename = value.asset.name;
  const dotIndex = filename.lastIndexOf('.');

  if (part === 'name') {
    return dotIndex === -1 ? filename : filename.slice(0, dotIndex);
  } else if (part === 'extension') {
    return dotIndex === -1 ? '' : filename.slice(dotIndex + 1).toLowerCase();
  }

  return '';
};

export const getFileSize = (value: number) => {
  const units = ['KB', 'MB', 'GB', 'TB'];
  const divisor = 1024;
  let i = 0;
  let size = value;

  if (size < divisor) {
    return `${(size / divisor).toFixed(1)} ${units[i]}`;
  } else {
    size = size / divisor;
  }

  while (i < units.length - 1 && size >= divisor) {
    i++;
    size = size / divisor;
  }

  return `${Math.round(+size.toFixed(1) * 10) / 10} ${units[i]}`;
};

export const isFilePreviewable = (
  fileName: string,
  supportedFormats: string[],
): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return supportedFormats.includes(extension);
};

export const extractFilesFromEvent = (
  ev: Event,
  maxSize: number,
  maxSizeValue: number,
  maxSizeUnit: string,
): { validFiles: File[]; errors: string[] } => {
  let files: FileList | null = null;

  if ('dataTransfer' in ev && ev instanceof DragEvent) {
    files = ev.dataTransfer?.files || null;
  } else if (ev.target instanceof HTMLInputElement) {
    files = ev.target.files;
  }

  if (!files || files.length === 0) return { validFiles: [], errors: [] };

  const fileArray = Array.from(files);
  const validFiles = fileArray.filter((file) => file.size <= maxSize);
  const tooLargeFiles = fileArray.filter((file) => file.size > maxSize);
  const errors: string[] = [];

  if (tooLargeFiles.length) {
    tooLargeFiles.forEach((file) => {
      errors.push(
        `Данный файл превышает максимальный размер ${maxSizeValue}${maxSizeUnit}: ${file.name}`,
      );
    });
  }

  return { validFiles, errors };
};

export const generateAttachmentShareLink = (
  origin: string,
  type: string,
  slug: string,
  from: string,
  name: string,
  id: string,
): string => {
  const base = `${origin}/api/auth/file/${id}`;
  const query = `?slug=${slug}&type=${type}&from=${from}&name=${name}`;
  return base + query;
};

export const downloadAttachment = async (
  downloadRequest: () => Promise<BlobPart>,
  fileName: string,
): Promise<void> => {
  const data = await downloadRequest();
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.className = 'prevent-click-issue-outside';
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
