<template>
  <q-td :props="rowInfo">
    <AvatarImage
      :key="rowInfo.value?.name"
      :tooltip="avatarText(rowInfo.value).join(' ')"
      :text="
        [
          avatarText(rowInfo.value)[0]?.at(0),
          avatarText(rowInfo.value)[1]?.at(0),
        ].join(' ')
      "
      :image="rowInfo.value.avatar_id"
      :member="rowInfo.value"
      @click.stop="
        $router.push({
          path: `/${currentWorkspaceSlug}/user-activities/${rowInfo.row.author_detail.id}`,
        })
      "
    ></AvatarImage>
  </q-td>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import AvatarImage from 'src/components/AvatarImage.vue';

// utils
import aiplan from 'src/utils/aiplan';

const avatarText = aiplan.UserName;

defineProps<{
  rowInfo: any;
}>();

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
</script>
