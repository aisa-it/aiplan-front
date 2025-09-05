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
