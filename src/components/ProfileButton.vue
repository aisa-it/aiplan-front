<template>
  <v-btn
    v-if="user"
    icon
    variant="text"
    rounded="lg"
    :ripple="false"
    class="profile-btn"
  >
    <UserAvatar :user="user" :rounded="false" />

    <v-menu activator="parent" location="bottom end" :offset="4">
      <v-list min-width="200" rounded="lg">
        <v-list-item
          :title="t('common.menu.profile')"
          @click="$router.push('/profile')"
        />
        <v-list-item :title="t('common.menu.adminPanel')" />
        <v-divider />
        <v-list-item
          :title="t('common.menu.signOut')"
          base-color="error"
          @click="$emit('signOut')"
        />
        <v-list-item
          :title="t('common.menu.signOutEverywhere')"
          base-color="error"
          @click="$emit('signOutEverywhere')"
        />
      </v-list>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/stores/user-store';

import UserAvatar from './user-avatar/UserAvatar.vue';

const { t } = useI18n();

const { user } = storeToRefs(useUserStore());

defineEmits<{
  (e: 'signOut'): void;
  (e: 'signOutEverywhere'): void;
}>();
</script>
