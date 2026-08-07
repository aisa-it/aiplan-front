import { onBeforeUnmount, ref } from 'vue';

import { MAX_AVATAR_SIZE_MB } from '../../profile.config';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/gif', 'image/jpeg'];

export function useAvatarUpload(isProfile: () => boolean) {
  const image = ref<File | null>(null);
  const imageSrc = ref('');
  const isDragActive = ref(false);
  const isValidImage = ref(true);

  const clearImageSrc = () => {
    if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
    imageSrc.value = '';
  };

  const reset = () => {
    clearImageSrc();
    image.value = null;
    isDragActive.value = false;
    isValidImage.value = true;
  };

  const selectFile = (file?: File) => {
    if (!file) return;

    const isValidSize =
      !isProfile() || file.size / 1024 / 1024 <= MAX_AVATAR_SIZE_MB;
    isValidImage.value =
      ACCEPTED_IMAGE_TYPES.includes(file.type) && isValidSize;

    clearImageSrc();
    if (!isValidImage.value) {
      image.value = null;
      return;
    }

    image.value = file;
    imageSrc.value = URL.createObjectURL(file);
  };

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    selectFile(input.files?.[0]);
    input.value = '';
  };

  const handleDrop = (event: DragEvent) => {
    isDragActive.value = false;
    selectFile(event.dataTransfer?.files[0]);
  };

  onBeforeUnmount(clearImageSrc);

  return {
    accept: ACCEPTED_IMAGE_TYPES.join(','),
    handleDrop,
    handleInput,
    image,
    imageSrc,
    isDragActive,
    isValidImage,
    reset,
  };
}
