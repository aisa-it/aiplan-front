<template>
  <UploadAvatarDialog
    title="Загрузить изображение"
    @upload="uploadWorkspaceAvatar"
  />
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import UploadAvatarDialog from 'src/components/UploadAvatarDialog.vue';
import { uploadWorkspaceLogo } from 'src/modules/workspace-settings/services/api';

const props = defineProps<{
  currentWorkspace: any;
}>();

const emits = defineEmits<{ success: []; error: []; update: [] }>();

const { currentWorkspace: currentWS } = toRefs(props);

const uploadWorkspaceAvatar = async (image: File) => {
  if (!image) return;
  try {
    await uploadWorkspaceLogo(currentWS.value.slug, image);
    emits('update');
    emits('success');
  } catch {
    emits('error');
  }
};
</script>
