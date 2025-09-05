<template>
  <q-item
    class="flex full-w justify-between items-center q-pa-none wrapper"
    style="min-height: auto"
  >
    <div class="attachment centered-horisontally sub-text">
      <DocumentIcon style="min-width: 24px" />
      <div
        class="flex no-wrap"
        :class="{ 'color-primary': isAvailable }"
        style="max-width: 40% !important; width: fit-content"
      >
        <span class="inline-block abbriviated-text">
          {{ fileAtr.name + '.' }}
        </span>
        <span> {{ fileAtr.extension }}</span>
      </div>

      <span> ({{ row.size ? format.humanStorageSize(row.size) : '' }}) </span>
      <q-linear-progress
        v-if="downloadProgress"
        size="xl"
        animationSpeed="200"
        :value="downloadProgress / 100"
        color="primary"
      />
      <q-btn
        flat
        dense
        icon="close"
        class="q-py-none"
        size="8px"
        @click="handleDelete"
      />
    </div>

    <span
      v-if="!isAvailable && !downloadProgress"
      style="color: #dc3e3e !important; white-space: nowrap"
      >Ошибка! Неподходящий формат или размер файла!</span
    >
  </q-item>
</template>
<script setup lang="ts">
import { format } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import {
  AIDOC_ACCEPTABLE_FILE_FORMATS,
  MAX_SIZE_FILE,
} from 'src/constants/aidocFiles';

const props = defineProps<{ row: File }>();
const emits = defineEmits<{
  delete: [];
}>();

const downloadProgress = ref(0);

const fileAtr = computed(() => {
  const splittedName = props.row.name.split('.');
  const name = splittedName.slice(0, splittedName.length - 1).join('.');
  const extension = splittedName[splittedName.length - 1].toLocaleLowerCase();
  return { name, extension };
});

const fileSize = computed(() => {
  return props.row.size;
});

const isAvailable = computed(() => {
  return (
    AIDOC_ACCEPTABLE_FILE_FORMATS.includes(fileAtr.value.extension) &&
    fileSize.value < MAX_SIZE_FILE
  );
});

const handleDelete = () => {
  emits('delete');
};

onMounted(() => {
  if (!isAvailable.value) return;

  let progress = 0;
  const duration = 700;
  const startTime = performance.now();

  const animate = (time: number) => {
    const elapsed = time - startTime;
    progress = Math.min((elapsed / duration) * 100, 100);
    downloadProgress.value = progress;

    if (progress < 100) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => (downloadProgress.value = 0), 500);
    }
  };
  requestAnimationFrame(animate);
});

defineExpose({ isAvailable });
</script>

<style lang="scss" scoped>
.wrapper {
  @media screen and (max-width: 760px) {
    flex-wrap: wrap !important;
  }
}
.attachment {
  width: 100%;
  overflow: hidden;
  gap: 4px;
  :deep(.q-linear-progress) {
    width: 40%;
    border-radius: 4px !important;
    margin-left: auto;
  }
}
</style>
