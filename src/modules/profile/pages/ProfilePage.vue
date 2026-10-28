<template>
  <main
    class="w-full p-4 sm:p-6 flex min-h-[calc(100dvh-var(--v-layout-top,0px))] flex-col"
  >
    <div>
      <h3 class="mt-2 mb-0 text-5xl">{{ t('profile.title') }}</h3>

      <div class="relative">
        <div class="my-4 flex items-center justify-between gap-4">
          <ProfilePreview v-if="user" :user="user" />
        </div>

        <v-tabs v-model="profileSettingsTab" color="primary">
          <v-tab v-for="tab in listTabs" :key="tab.name" :value="tab.name">
            {{ t(`profile.tabs.${tab.name}`) }}
          </v-tab>
        </v-tabs>
      </div>
    </div>

    <div class="relative flex-1">
      <template v-for="tab in listTabs" :key="tab.name">
        <component
          :is="tab.component"
          v-if="user && tab.name === profileSettingsTab && tab.component"
          :user="user"
        />
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/stores/user-store';

import ProfilePreview from '../components/ProfilePreview.vue';
import { useProfileTabs } from '../composables/useProfileTabs';

const { t } = useI18n();
const { listTabs, profileSettingsTab } = useProfileTabs();
const { user } = storeToRefs(useUserStore());
</script>
