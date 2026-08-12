<template>
  <div
    class="flex flex-row justify-center gap-3 items-center max-[480px]:flex-col text-[16px] leading-[22px] tracking-[0.5px] font-normal align-middle text-center"
  >
    <span :class="isNight ? 'text-[#bac4d5]' : 'text-[#474a52]'">
      Добро пожаловать,
    </span>
    <div
      class="rounded-[100px] w-fit p-[8px_16px_8px_8px] flex items-center gap-[6px]"
      :class="
        isNight ? 'bg-[#383838] border border-[#5e5e5e]' : 'bg-[#ffffff7a]'
      "
    >
      <UserAvatar
        v-if="user"
        :user="user"
        :rounded="true"
      />
      <span
        class="font-semibold text-[16px] leading-[22px] tracking-[0.5px]"
        :class="isNight ? 'text-[#bac4d5]' : 'text-[#474a52]'"
      >
        {{ userFullName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import UserAvatar from '@/components/user-avatar/UserAvatar.vue';

// stores
import { useUserStore } from '@/stores/user-store';

// utils
import { getUserName } from '@/utils/helpers';

const { user } = storeToRefs(useUserStore());

const userFullName = computed(() => {
  return user.value ? getUserName(user.value) : '';
});

defineProps<{
  isNight: boolean;
}>();
</script>
