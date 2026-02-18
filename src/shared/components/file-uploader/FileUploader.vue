<template>
  <div class="q-mt-sm">
    <q-btn
      v-if="
        maxItems === false ||
        (typeof maxItems === 'number' && (attachments?.length || 0) < maxItems)
      "
      class="btn upload-btn full-w"
      no-caps
      @click="triggerUpload"
      @drop.prevent="handleDrop"
      @dragenter.prevent="isDragIn = true"
      @dragover.prevent="isDragIn = true"
      @dragleave.prevent="isDragIn = false"
      :class="{ isDragIn: isDragIn }"
      style="min-height: 50px"
      :style="uploadBtnStyle"
    >
      <div v-if="!loading" class="flex items-center">
        <LinkIcon color="var(--primary)" />
        <span> {{ label || 'Нажмите или перетяните файл сюда' }} </span>
      </div>
      <DefaultLoader v-if="loading" />
    </q-btn>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      @change="handleFileSelect"
    />

    <slot name="file_list" :attachments="attachments">
      <div v-if="attachments?.length" class="row q-col-gutter-sm q-mt-sm">
        <div v-for="attachment in attachments" :key="attachment.id">
          <FileUploaderCard
            :file="attachment"
            :is-edit="true"
            :download-handler="downloadHandler"
            @delete="handleDelete(attachment.id)"
            @open="handleOpen(attachment)"
          >
            <template #actions="slotProps">
              <slot name="actions" v-bind="slotProps" />
            </template>
          </FileUploaderCard>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
//core
import { ref } from 'vue';
//components
import FileUploaderCard from './FileUploaderCard.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
//types
import { IAttachmentCard } from 'src/interfaces/files';
import { StyleValue } from 'vue';

const props = withDefaults(
  defineProps<{
    attachments?: IAttachmentCard[];
    label?: string;
    accept?: string;
    loading?: boolean;
    maxItems?: number | boolean;
    downloadHandler?: (
      file: IAttachmentCard,
      onProgress: (progress: number) => void,
    ) => Promise<void>;
    uploadBtnStyle?: StyleValue;
  }>(),
  {
    maxItems: false,
  },
);

const emit = defineEmits<{
  (e: 'upload', file: File): void;
  (e: 'delete', id: string): void;
  (e: 'open', attachment: any): void;
}>();

//refs
const fileInput = ref<HTMLInputElement | null>(null);
const isDragIn = ref(false);

//methods
const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('upload', target.files[0]);
  }
  if (fileInput.value) fileInput.value.value = '  ';
};

const handleDrop = (event: DragEvent) => {
  isDragIn.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    emit('upload', event.dataTransfer.files[0]);
  }
};

const handleOpen = (attachment: any) => {
  emit('open', attachment);
};

const handleDelete = (id: string) => {
  emit('delete', id);
};
</script>

<style scoped lang="scss">
.isDragIn {
  background-color: color-mix(in srgb, $primary, transparent 90%);
}
</style>
