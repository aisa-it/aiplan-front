<template>
  <FileUploader
    :attachments="field.attachments"
    :loading="submitting"
    :max-items="1"
    :download-handler="downloadDraftFile"
    @upload="handleFileSelect"
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

//components
import FileUploader from 'src/shared/components/file-uploader/FileUploader.vue';
import DocPreviewDialog from 'src/components/dialogs/DocPreviewDialog.vue';
import AttachmentsInfo from 'src/components/AttachmentsInfo.vue';

//stores
import { useNotificationStore } from 'src/stores/notification-store';
import { useUserStore } from 'src/stores/user-store';

//utils
import { clearFieldAttachment } from 'src/components/forms/helper/helperForm';
import { IAttachmentCard } from 'src/interfaces/files';

const props = defineProps<{
  modelValue: string | null;
  field: any;
  formSlug: string;
  workspaceSlug: string;
  emptyUserAllowed?: boolean;
  submitting?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

//stores
const { setNotificationView } = useNotificationStore();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

//consts
const MAX_SIZE_FILE_VALUE = 50;
const MAX_SIZE_FILE_UNIT = 'мб';
const MAX_SIZE_FILE = MAX_SIZE_FILE_VALUE * 1024 * 1024;

//refs
const isPreviewOpen = ref(false);
const previewFile = ref();

const buildDraftAttachment = (
  file: File,
  localId: string,
): IAttachmentCard => ({
  id: localId,
  created_at: new Date().toISOString(),
  draft: true,
  asset: {
    id: localId,
    name: file.name,
    size: file.size,
    content_type: file.type,
  },
});

const downloadDraftFile = async (
  _attachment: IAttachmentCard,
  onProgress: (progress: number) => void,
) => {
  const pendingFile = props.field.pendingAttachment?.file;
  if (!pendingFile) return;

  onProgress(0);

  const url =
    props.field.pendingAttachment?.previewUrl ??
    URL.createObjectURL(pendingFile);
  const shouldRevoke = !props.field.pendingAttachment?.previewUrl;

  const link = document.createElement('a');
  link.href = url;
  link.download = pendingFile.name;
  link.click();

  if (shouldRevoke) {
    URL.revokeObjectURL(url);
  }

  onProgress(100);
};

const handleFileSelect = (file: File) => {
  if (file.size > MAX_SIZE_FILE) {
    setNotificationView({
      type: 'error',
      customMessage: `Файл слишком большой. Максимальный размер ${MAX_SIZE_FILE_VALUE} ${MAX_SIZE_FILE_UNIT}`,
      open: true,
    });
    return;
  }

  if (!props.emptyUserAllowed && !user.value?.id) {
    setNotificationView({
      type: 'error',
      customMessage: 'Для загрузки файла авторизуйтесь или зарегистрируйтесь',
      open: true,
    });
    return;
  }

  // Сборка файла-заглушки
  clearFieldAttachment(props.field);

  const localId = crypto.randomUUID();
  const previewUrl = URL.createObjectURL(file);

  props.field.pendingAttachment = { localId, file, previewUrl };
  props.field.attachments = [buildDraftAttachment(file, localId)];
  emit('update:modelValue', localId);
};

const handleDelete = () => {
  clearFieldAttachment(props.field);
  emit('update:modelValue', null);
};

const handleOpen = (file: IAttachmentCard) => {
  if (!file) return;

  if (file.draft && props.field.pendingAttachment?.previewUrl) {
    previewFile.value = { asset: props.field.pendingAttachment.previewUrl };
  } else {
    previewFile.value = file;
  }

  isPreviewOpen.value = true;
};
</script>
