<template>
  <q-dialog @hide="() => (attachments = [])">
    <q-card class="form-modal-card q-pa-md">
      <q-card-section class="column q-pa-none">
        <span style="font-size: 20px" class="q-mb-sm">{{
          itemExport.title
        }}</span>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-btn
          class="btn upload-btn-import full-w"
          no-caps
          @click="uploadInput.click()"
          @drop="handleDrop"
        >
          <div class="flex items-center">
            <LinkIcon color="var(--primary)" />
            <span> Перетащите или нажмите, чтобы выбрать файл </span>
          </div>
        </q-btn>
        <div class="q-mt-xs">
          <AttachmentCard
            v-for="(row, index) in attachments"
            @delete="onDeleteFile(index)"
            ref="attachmentCardRef"
            :key="row.name"
            :row="row"
          />
        </div>
      </q-card-section>
      <q-card-section
        class="q-pb-none q-pr-none q-pl-none"
        :class="$q.screen.lt.sm ? 'column' : 'row justify-end'"
      >
        <q-btn
          no-caps
          class="secondary-btn q-mr-sm"
          :style="$q.screen.lt.sm ? 'order: 1; width: 100%' : 'width: 102px'"
          label="Отменить"
          v-close-popup
        />
        <q-btn
          no-caps
          disable
          class="primary-btn create-btn"
          :class="$q.screen.lt.sm ? 'q-mb-sm' : ''"
          label="Загрузить"
          v-close-popup
          :style="$q.screen.lt.sm ? 'width: 100%' : 'width: 102px'"
        />
      </q-card-section>
    </q-card>
    <input
      type="file"
      style="display: none"
      ref="uploadInput"
      multiple
      @change="handleDrop"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AttachmentCard from '../dialogs/AIDocDialogs/cards/AttachmentCard.vue';
import { useNotificationStore } from 'src/stores/notification-store';
import { ERROR_EXTENSION_FILE } from 'src/constants/notifications';

const props = defineProps({
  itemExport: {
    type: Object,
    required: true,
  },
});

const { setNotificationView } = useNotificationStore();
const uploadInput = ref<HTMLInputElement>();
const attachments = ref<File[]>([]);

const handleDrop = (ev: Event) => {
  const target = ev.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!props.itemExport.extensions.includes(ext)) {
        setNotificationView({
          open: true,
          type: 'error',
          customMessage: ERROR_EXTENSION_FILE,
        });
        return;
      }
    }
    attachments.value.push(...Array.from(files));
  }
  if (uploadInput.value) uploadInput.value.value = '';
};

const onDeleteFile = (index: number) => {
  attachments.value.splice(index, 1);
};
</script>
