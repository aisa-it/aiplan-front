<template>
  <div class="h-screen w-full flex flex-col items-center justify-center">
    <div
      class="text-[200px] font-light leading-[237px] tracking-[-3.88px] text-center"
    >
      404
    </div>

    <div
      class="text-[32px] font-normal leading-[37.92px] tracking-[-0.62px] text-center mt-4"
    >
      {{ t('common.screens.notFound.title') }}
    </div>

    <div class="flex justify-center mt-12">
      <v-btn
        color="primary"
        class="text-none px-6"
        size="large"
        flat
        @click="goHome"
      >
        {{ t('common.screens.notFound.home') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

//TODO: доделать логику страницы 404

const goHome = () => {
  router.push('/');
};
</script>
