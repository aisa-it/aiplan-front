<template>
  <v-menu
    v-model="isOpen"
    transition="scale-transition"
    :location="isShowPopupMiddle ? 'bottom center' : undefined"
    :origin="isShowPopupMiddle ? 'top center' : undefined"
  >
    <div
      class="flex max-h-60 max-w-85 items-center justify-center gap-2.5 p-2.5"
    >
      <UserAvatar
        v-if="showAvatarPopup"
        :image="image"
        :text="text"
        :error="error"
        :theme="theme"
        :ny="ny"
      />

      <UserInfoDetails
        :member="member"
        :tooltip="tooltip"
        :show-avatar="showAvatarPopup"
        :is-text-center="isPopupTextCenter"
      />
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import UserAvatar from './UserAvatar.vue';
import UserInfoDetails from './UserInfoDetails.vue';

withDefaults(
  defineProps<{
    member?: object;
    isShowPopupMiddle?: boolean;
    isPopupTextCenter?: boolean;
    showAvatarPopup?: boolean;
    tooltip?: string;
    image?: string;
    text?: string;
    error?: string;
    theme: string;
    ny: boolean;
  }>(),
  {
    isShowPopupMiddle: false,
    isPopupTextCenter: false,
    showAvatarPopup: true,
  },
);

const isOpen = ref(false);

const showMenu = () => {
  isOpen.value = true;
};

defineExpose({
  showMenu,
});
</script>
