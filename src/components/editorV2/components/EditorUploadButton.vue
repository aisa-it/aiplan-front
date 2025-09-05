<template>
  <q-btn dense flat @click="onImageUpload">
    <HintTooltip>Загрузить изображение</HintTooltip>
    <component :is="ICONS.pictureIcon" />
    <input
      ref="fileInput"
      style="display: none"
      type="file"
      accept="image/*"
      multiple
      @change="uploadImage"
    />
  </q-btn>
</template>

<script lang="ts">
import { Editor } from '@tiptap/vue-3';
import { defineComponent, PropType, ref } from 'vue';
// utils
import { ICONS } from 'src/utils/icons';
import { notSupportableFormat } from 'src/components/editorV2/utils/tiptap';
import { ERROR_FORMAT_FILE } from 'src/constants/notifications';
import { useNotificationStore } from 'src/stores/notification-store';

export default defineComponent({
  name: 'EditorUploadButton',
  props: {
    editorInstance: {
      type: Object as PropType<Editor>,
      required: true,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // vars
    const { setNotificationView } = useNotificationStore();
    const fileInput = ref<HTMLInputElement | null>(null);

    // function
    const onImageUpload = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const uploadImage = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files?.length) {
        return;
      }
      const files = Array.from(target.files);
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setNotificationView({
            open: true,
            type: 'error',
            customMessage: ERROR_FORMAT_FILE,
          });
          continue;
        }
        if (notSupportableFormat.includes(file.type.split('/')[1])) {
          setNotificationView({
            open: true,
            type: 'error',
            customMessage: ERROR_FORMAT_FILE,
          });
          return;
        }
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64 = e.target?.result as string;

          if (props.isMobile) {
            props.editorInstance
              .chain()
              .setImage({
                src: base64,
                alt: file.name.replace(/\.[^/.]+$/, ''),
              })
              .run();
          } else {
            props.editorInstance
              .chain()
              .focus()
              .setImage({
                src: base64,
                alt: file.name.replace(/\.[^/.]+$/, ''),
              })
              .run();
          }
        };

        reader.readAsDataURL(file);
      }

      target.value = '';
    };

    return {
      ICONS,
      fileInput,
      uploadImage,
      onImageUpload,
    };
  },
});
</script>
