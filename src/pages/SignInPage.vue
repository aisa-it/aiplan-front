<template>
  <LoginLayout>
    <template #title>Авторизация</template>

    <template #default>
      <LoginForm />
    </template>

    <template #actions>
      <v-btn
        density="compact"
        variant="text"
        color="primary"
        class="text-primary text-sm rounded-none mt-2"
        @click="() => $router.push('/signup')"
        size="large"
      >
        Нет аккаунта? Зарегистрируйтесь
      </v-btn>
    </template>
  </LoginLayout>
</template>
<script setup lang="ts">
import LoginLayout from '@/layouts/LoginLayout.vue';
import LoginForm from '@/shared/LoginForm.vue'

</script>
