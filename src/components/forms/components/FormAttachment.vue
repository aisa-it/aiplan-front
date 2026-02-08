<template>
  <FileUploader
    :model-value="modelValue ? [modelValue] : []"
    :attachments="field.attachments"
    :loading="uploading"
    :max-items="1"
    @upload="handleUpload"
    @delete="handleDelete"
    @open="handleOpen"
  />
  <DocPreviewDialog
    v-if="isPreviewOpen"
    v-model="isPreviewOpen"
    :file="previewFile"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createFormAttachments } from 'src/components/forms/services/api';
import FileUploader from 'src/shared/components/file-uploader/FileUploader.vue';
import { useNotificationStore } from 'src/stores/notification-store';
import { useFormStore } from 'src/stores/form-store';
import DocPreviewDialog from 'src/components/dialogs/DocPreviewDialog.vue';

const props = defineProps<{
  modelValue: string | null;
  field: any;
  formSlug: string;
  workspaceSlug: string;
}>();

const emit = defineEmits(['update:modelValue']);

const { setNotificationView } = useNotificationStore();
const formStore = useFormStore();
const uploading = ref(false);

const handleUpload = async (file: File) => {
  uploading.value = true;
  try {
    const response = await createFormAttachments(
      props.workspaceSlug,
      props.formSlug,
      { asset: file },
    );

    const attachmentId = response.id;

    props.field.attachments = [response];
    emit('update:modelValue', attachmentId);
  } catch (error) {
    console.error('Upload error:', error);
    setNotificationView({
      type: 'error',
      customMessage: 'Не удалось загрузить файл',
      open: true,
    });
  } finally {
    uploading.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (!id || !props.formSlug) return;

  try {
    await formStore.deleteFormAttachment(props.formSlug, id);

    if (Array.isArray(props.field.attachments)) {
      props.field.attachments = props.field.attachments.filter(
        (a: any) => a.id !== id,
      );
    }

    if (props.modelValue === id) {
      emit('update:modelValue', null);
    }
  } catch (error) {
    console.error('Delete error:', error);
    setNotificationView({
      type: 'error',
      customMessage: 'Не удалось удалить файл',
      open: true,
    });
  }
};

const isPreviewOpen = ref(false);
const previewFile = ref();

const handleOpen = (file: any) => {
  if (!file) return;
  previewFile.value = file;
  isPreviewOpen.value = true;
};
</script>
