<template>
  <FileUploader
    :attachments="field.attachments"
    :loading="uploading"
    :max-items="1"
    @upload="handleUpload"
    @delete="handleDelete"
    @open="handleOpen"
    :upload-btn-style="{ minHeight: '156px' }"
  />
  <AttachmentsInfo
    class="q-mt-sm"
    :max-size-value="MAX_SIZE_FILE_VALUE"
    :max-size-unit="MAX_SIZE_FILE_UNIT"
  />
  <DocPreviewDialog
    v-if="isPreviewOpen"
    v-model="isPreviewOpen"
    :file="previewFile"
  />
</template>

<script setup lang="ts">
//core
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

//api
import { createFormAttachments } from 'src/components/forms/services/api';

//components
import FileUploader from 'src/shared/components/file-uploader/FileUploader.vue';
import DocPreviewDialog from 'src/components/dialogs/DocPreviewDialog.vue';
import AttachmentsInfo from 'src/components/AttachmentsInfo.vue';

//stores
import { useNotificationStore } from 'src/stores/notification-store';
import { useFormStore } from 'src/stores/form-store';
import { useUserStore } from 'src/stores/user-store';

const props = defineProps<{
  modelValue: string | null;
  field: any;
  formSlug: string;
  workspaceSlug: string;
}>();

const emit = defineEmits(['update:modelValue']);

//stores
const { setNotificationView } = useNotificationStore();
const formStore = useFormStore();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

//consts
const MAX_SIZE_FILE_VALUE = 50;
const MAX_SIZE_FILE_UNIT = 'мб';
const MAX_SIZE_FILE = MAX_SIZE_FILE_VALUE * 1024 * 1024;

//refs
const uploading = ref(false);
const isPreviewOpen = ref(false);
const previewFile = ref();

//methods
const handleUpload = async (file: File) => {
  uploading.value = true;

  if (file.size > MAX_SIZE_FILE) {
    setNotificationView({
      type: 'error',
      customMessage: `Файл слишком большой. Максимальный размер ${MAX_SIZE_FILE_VALUE} ${MAX_SIZE_FILE_UNIT}`,
      open: true,
    });
    uploading.value = false;
    return;
  }

  if (!user.value?.id) {
    setNotificationView({
      type: 'error',
      customMessage: 'Для загрузки файла авторизуйтесь или зарегистрируйтесь',
      open: true,
    });
    uploading.value = false;
    return;
  }

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

const handleOpen = (file: any) => {
  if (!file) return;
  previewFile.value = file;
  isPreviewOpen.value = true;
};
</script>
