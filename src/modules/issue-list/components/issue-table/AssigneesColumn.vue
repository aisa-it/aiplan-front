<template>
  <q-td :props="rowInfo" style="position: relative">
    <AvatarImage
      v-for="(l, n) in rowInfo.value"
      :style="{ zIndex: rowInfo.value.length - n + 2 }"
      class="overlapping"
      :key="l?.name"
      :tooltip="avatarText(l).join(' ')"
      :text="[avatarText(l)[0]?.at(0), avatarText(l)[1]?.at(0)].join(' ')"
      :image="l.avatar_id"
      :member="l"
      @click.stop="
        $router.push({
          path: `/${currentWorkspaceSlug}/user-activities/${rowInfo.row.assignee_details[n]?.id}`,
        })
      "
    >
    </AvatarImage>
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
