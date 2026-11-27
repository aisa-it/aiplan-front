<template>
  <section class="space-y-2">
    <h3
      class="flex items-center gap-3 text-lg leading-6 font-semibold tracking-[0.15px]"
    >
      {{ t('issues.columns.attachment_count') }}
      <span class="issue-attachment-count">{{ files.length }}</span>
    </h3>

    <div
      class="pt-3"
      @dragenter.prevent="onDragOver"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.stop.prevent="onDrop"
    >
      <v-btn
        type="button"
        block
        color="primary"
        :variant="isDragging ? 'tonal' : 'outlined'"
        :disabled="disabled"
        class="issue-attachment-dropzone"
        @click="fileInput?.click()"
      >
        <template #prepend>
          <LinkIcon aria-hidden="true" />
        </template>
        <span class="whitespace-normal text-center">
          {{ t('issues.create.attachments.add') }}
        </span>
      </v-btn>
    </div>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      multiple
      :disabled="disabled"
      @change="onFileChange"
    />

    <ul v-if="files.length" class="space-y-1">
      <li
        v-for="(file, index) in files"
        :key="index"
        class="flex min-w-0 items-center gap-2 rounded-lg px-2"
      >
        <span class="flex-1 truncate text-sm" :title="file.name">
          {{ file.name }}
        </span>
        <span class="shrink-0 text-xs opacity-70">
          {{ formatFileSize(file.size) }}
        </span>
        <v-btn
          type="button"
          icon="mdi-close"
          size="small"
          variant="text"
          :aria-label="
            t('issues.create.attachments.remove', { name: file.name })
          "
          :disabled="disabled"
          @click="removeFile(index)"
        />
      </li>
    </ul>

    <ul v-if="oversizedFiles.length" role="alert" class="text-sm text-error">
      <li v-for="(name, index) in oversizedFiles" :key="index">
        {{ t('issues.create.attachments.tooLarge', { name }) }}
      </li>
    </ul>

    <div class="text-xs">
      <div>
        {{ t('issues.create.attachments.formats') }}:
        <v-dialog
          v-model="isFormatsDialogOpen"
          max-width="570"
          :aria-labelledby="formatsDialogTitleId"
        >
          <template #activator="{ props: activatorProps }">
            <button
              v-bind="activatorProps"
              type="button"
              class="cursor-pointer font-bold text-inherit"
            >
              {{ t('issues.create.attachments.showFormats') }}
            </button>
          </template>
          <v-card class="rounded-xl">
            <v-card-title :id="formatsDialogTitleId">
              {{ t('issues.create.attachments.formats') }}
            </v-card-title>
            <v-card-text class="space-y-1">
              <p v-for="(formats, group) in FORMAT_GROUPS" :key="group">
                <strong>
                  {{ t(`issues.create.attachments.formatGroups.${group}`) }}:
                </strong>
                {{ formats }}
              </p>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                type="button"
                color="primary"
                variant="outlined"
                @click="isFormatsDialogOpen = false"
              >
                {{ t('common.actions.close') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <p>{{ t('issues.create.attachments.sizeLimit') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';

import LinkIcon from '@/components/icons/LinkIcon.vue';

const MAX_FILE_SIZE = 4 * 1024 ** 3;
const FILE_SIZE_UNITS = [
  [1024 ** 3, 'gigabyte'],
  [1024 ** 2, 'megabyte'],
  [1024, 'kilobyte'],
] as const;
const FORMAT_GROUPS = {
  documents:
    '.doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .rtf, .odt, .ods, .odp',
  images: '.jpg, .jpeg, .png, .gif, .svg, .bmp, .tiff, .tif',
  archives: '.zip, .rar, .7z',
  audio: '.mp3, .wav, .ogg, .oga, .opus, .m4a, .aac, .flac',
  video: '.mp4, .avi, .mov, .mkv',
  other: '.csv, .html, .htm, .json, .xml',
};

const props = defineProps<{ disabled?: boolean }>();
const files = defineModel<File[]>({ required: true });
const { t, locale } = useI18n();

const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const oversizedFiles = ref<string[]>([]);
const isFormatsDialogOpen = ref(false);
const formatsDialogTitleId = useId();

function formatFileSize(size: number) {
  const [divisor, unit] = FILE_SIZE_UNITS.find(
    ([divisor]) => size >= divisor,
  ) ?? [1, 'byte'];
  return new Intl.NumberFormat(locale.value, {
    style: 'unit',
    unit,
    maximumFractionDigits: 1,
  }).format(size / divisor);
}

function appendFiles(selection: FileList | null | undefined) {
  if (props.disabled || !selection?.length) return;

  const selected = Array.from(selection);
  const valid = selected.filter((file) => file.size <= MAX_FILE_SIZE);
  oversizedFiles.value = selected
    .filter((file) => file.size > MAX_FILE_SIZE)
    .map((file) => file.name);
  if (valid.length) files.value = [...files.value, ...valid];
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  appendFiles(input.files);
  input.value = '';
}

function onDragOver(event: DragEvent) {
  if (props.disabled || !event.dataTransfer?.types.includes('Files')) return;

  event.dataTransfer.dropEffect = 'copy';
  isDragging.value = true;
}

function onDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement;
  if (
    event.relatedTarget instanceof Node &&
    target.contains(event.relatedTarget)
  )
    return;

  isDragging.value = false;
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  appendFiles(event.dataTransfer?.files);
}

function removeFile(index: number) {
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index);
}
</script>

<style scoped>
.issue-attachment-count {
  display: inline-flex;
  min-width: 23px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding-inline: 8px;
  border-radius: 12px;
  color: rgb(var(--v-theme-surface));
  background-color: rgb(var(--v-theme-text));
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: normal;
}

.issue-attachment-dropzone {
  min-height: 88px;
  border-style: dashed;
}
</style>
