<template>
  <div
    class="flex flex-row justify-center gap-3 items-center max-[30rem]:flex-col text-[1rem] leading-[1.375rem] tracking-[0.03125rem] font-normal align-middle text-center"
  >
    <span class="text-[color:var(--conf-text)]">
      {{ t('conference.welcome') }}
    </span>
    <div
      class="rounded-[6.25rem] w-fit p-[0.5rem_1rem_0.5rem_0.5rem] flex items-center gap-[0.375rem] bg-[color:var(--conf-surface)] border border-[color:var(--conf-border)]"
    >
      <UserAvatar v-if="user" :user="user" :rounded="true" />
      <span
        class="font-semibold text-[1rem] leading-[1.375rem] tracking-[0.03125rem] text-[color:var(--conf-text)]"
      >
        {{ userFullName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UserAvatar from '@/components/user-avatar/UserAvatar.vue';

// stores
import { useUserStore } from '@/stores/user-store';

// utils
import { getUserName } from '@/utils/helpers';

const { t } = useI18n();
const { user } = storeToRefs(useUserStore());

const userFullName = computed(() => {
  return user.value ? getUserName(user.value) : '';
});
</script>
