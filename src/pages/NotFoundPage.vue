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
      Страница не найдена
    </div>

    <div class="flex justify-center mt-12">
      <v-btn
        color="primary"
        class="text-none px-6"
        size="large"
        flat
        @click="goHome"
      >
        Вернуться на главную
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

//TODO: доделать логику страницы 404

const goHome = () => {
  router.push('/');
};
</script>
