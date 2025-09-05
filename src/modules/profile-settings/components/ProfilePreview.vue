<template>
  <div class="profile-preview">
    <AvatarImage
      :class="`profile-preview__avatar flex-shrink-0 ${ny ? 'q-mt-lg' : ''}`"
      :member="userStore.user"
      :text="getUsername(userStore.user)"
      :image="userStore.user.avatar_id ? userStore.user.avatar_id : undefined"
      :size="isMobile ? '60px' : '100px'"
    />

    <div class="q-ml-md">
      <div class="flex items-center gap-2">
        <div
          :class="`profile-preview__username q-mr-xs ${
            isMobile ? 'profile-preview__username_mobile' : ''
          }`"
        >
          {{ `${userStore.user.first_name} ${userStore.user.last_name}` }}
        </div>
        <SelectUserStatus />
      </div>
      <div class="profile-preview__email">
        {{ userStore.user.email }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';

import AvatarImage from 'src/components/AvatarImage.vue';
import SelectUserStatus from 'src/components/selects/SelectUserStatus.vue';
import { useProfilePreview } from '../composables/profile-preview/useProfilePreview';

const userStore = useUserStore();
const utilsStore = useUtilsStore();
const { ny } = storeToRefs(utilsStore);

const { isMobile, getUsername } = useProfilePreview();
</script>

<style lang="scss" scoped>
.profile-preview {
  display: flex;
  align-items: center;

  &__avatar:deep(.text-avatar) {
    font-size: 18px;
  }

  &__username {
    word-break: break-word;
    font-size: 30px;

    &_mobile {
      font-size: 18px;
    }
  }

  &__email {
    font-size: 18px;
    color: #8b8b98;
  }
}
</style>
