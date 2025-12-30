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
      @click.stop="navigateToActivityPage(rowInfo.row.author_detail.id)"
    ></AvatarImage>
  </q-td>
</template>

<script setup lang="ts">
// components
import AvatarImage from 'src/components/AvatarImage.vue';

// utils
import aiplan from 'src/utils/aiplan';

// composables
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

const avatarText = aiplan.UserName;

defineProps<{
  rowInfo: any;
}>();

const { navigateToActivityPage } = useUserActivityNavigation();
</script>
