<template>
  <div
    id="vanta-clouds-bg"
    class="w-screen h-screen relative overflow-hidden flex flex-col items-center justify-center"
    :class="isNight ? 'conf-night' : 'conf-day'"
  >
    <div
      class="absolute right-0 bottom-0 m-[0_0.75rem_0.75rem_0] rounded-2xl p-1"
    >
      <v-btn
        icon
        variant="outlined"
        size="small"
        class="border-[color:var(--conf-border)] text-[color:var(--conf-text)]"
        @click="toggleClouds()"
      >
        <CloudsEnable v-if="!isEnableClouds" />
        <CloudsDisable v-else />
        <v-tooltip activator="parent" location="top start">
          {{
            isEnableClouds
              ? t('conference.disableAnimation')
              : t('conference.enableAnimation')
          }}
        </v-tooltip>
      </v-btn>
    </div>

    <v-btn
      v-show="!loading"
      variant="flat"
      height="2.5rem"
      width="2.5rem"
      min-width="2.5rem"
      class="absolute right-0 top-0 m-[0.75rem_0.75rem_0_0] z-[999] hover:opacity-100 px-0 min-w-0"
      color="error"
      @click="routeToWorkspace()"
    >
      <v-icon>mdi-exit-to-app</v-icon>
      <v-tooltip activator="parent" location="bottom left">
        {{ t('conference.toAiplan') }}
      </v-tooltip>
    </v-btn>

    <ConferenceEntryCard :loading="loading" :is-night="isNight" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// stores
import { useUserStore } from '@/stores/user-store';
import { storeToRefs } from 'pinia';

// components
import ConferenceEntryCard from './components/ConferenceEntryCard.vue';
import CloudsEnable from '@/components/icons/CloudsEnable.vue';
import CloudsDisable from '@/components/icons/CloudsDisable.vue';

// utils
import { getCurrentTimeOfDay } from './utils/timeOfDay';

// composables
import { useVantaClouds } from './composables/useVantaClouds';

const router = useRouter();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { t } = useI18n();

const { loading, isEnableClouds, init, toggleClouds } = useVantaClouds();

onMounted(async () => {
  await userStore.getUserInfo();
  await init();
});

const routeToWorkspace = () => {
  if (!user.value) {
    return;
  }
  router.push(`/${user.value?.last_workspace_slug || ''}`);
};

const isNight = computed(() => {
  return getCurrentTimeOfDay() === 'night';
});
</script>

<style scoped lang="scss">
.conf-day {
  --conf-text: #474a52;
  --conf-border: #dbdbdb;
  --conf-surface: #ffffff7a;
  --conf-field-bg: #ffffff;
}

.conf-night {
  --conf-text: #bac4d5;
  --conf-border: #5e5e5e;
  --conf-surface: #383838;
  --conf-field-bg: #383838;
}
</style>
