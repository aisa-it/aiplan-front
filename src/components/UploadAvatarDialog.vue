<template>
  <q-dialog @before-show="handleBeforeShow">
    <q-card :class="!!image ? 'upload-modal-card' : 'modal-card'">
      <q-card-section>
        <h6>{{ props.title }}</h6>
      </q-card-section>
      <q-card-section v-if="!!image" class="q-pt-none row justify-center">
        <img class="ws-image" :src="imageSrc" alt="" />
      </q-card-section>
      <q-card-section v-else class="q-pt-none">
        <q-btn
          no-caps
          class="btn upload-btn full-w dropzone"
          v-bind="getRootProps()"
        >
          <input v-bind="getInputProps()" :accept="accept.join(', ')" />
          <div v-if="isValidImage">
            <p v-if="isDragActive">Перетащите файл сюда...</p>
            <p v-else>Перетащите или нажмите, чтобы выбрать файл</p>
          </div>
          <div v-else class="error-card">
            <div>
              <AlertIcon color="#dc3e3e" />
            </div>
            <div>
              <p class="body-1-medium">При загрузке произошла ошибка</p>
              <p class="body-1">
                Убедитесь, что Вы загружаете файл в формате JPEG, GIF или PNG
                <span v-if="isProfile">не более 20 Мб</span> и попробуйте снова.
              </p>
            </div>
          </div>
        </q-btn>
      </q-card-section>
      <q-card-actions class="q-pt-none" align="right">
        <q-btn flat no-caps class="secondary-btn" v-close-popup>
          Отменить
        </q-btn>
        <q-btn
          flat
          no-caps
          class="primary-btn"
          :disable="!image"
          @click="onUpload"
          v-close-popup
        >
          Загрузить
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { useDropzone } from 'vue3-dropzone';
import { ref } from 'vue';
// components
import AlertIcon from 'src/components/icons/AlertIcon.vue';
import { isValidFileSize } from 'src/utils/validation';

const props = defineProps<{
  title: string;
  isProfile?: boolean;
}>();

const emits = defineEmits<{ upload: [image: File] }>();
const image = ref<File | null>(null);
const accept = ['image/png', 'image/gif', 'image/jpeg'];
const imageSrc = ref('');
const isValidImage = ref(true);

const onDrop = (acceptFiles: File[]) => {
  const file = acceptFiles[0];
  const isValidSize = !props.isProfile || isValidFileSize(file, 20);
  isValidImage.value = accept.includes(file.type) && isValidSize;
  if (!isValidImage.value) {
    image.value = null;
    imageSrc.value = '';
    return;
  }
  image.value = acceptFiles[0];
  imageSrc.value = image.value ? URL.createObjectURL(image.value) : '';
};

const onUpload = () => {
  if (image.value) emits('upload', image.value);
};

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

const handleBeforeShow = () => {
  image.value = null;
  imageSrc.value = '';
  isValidImage.value = true;
};
</script>
<style lang="scss" scoped>
.ws-image {
  min-height: 300px;
  max-height: 600px;
  border-radius: 8px;
  object-fit: contain;

  @media screen and (max-width: 1200px) {
    max-height: 400px;
  }

  @media screen and (max-width: 900px) {
    max-height: 300px;
  }

  @media screen and (max-width: 600px) {
    max-height: 200px;
    min-height: 100px;
  }

  @media screen and (max-width: 450px) {
    max-height: 120px;
    min-height: 80px;
  }
}

.upload-modal-card {
  border-radius: 16px !important;
  max-width: none !important;
}

.error-card {
  display: flex;
  border-radius: 4px;
  padding: 16px;
  max-width: 360px;
  gap: 12px;
  background: #ffece4;
  text-align: left;

  p {
    color: $dark;
    margin: 0;
  }
}
</style>
