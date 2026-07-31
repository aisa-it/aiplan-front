<template>
  <AuthLayout>
    <template #title>Авторизация</template>

    <template #default>
      <LoginForm />
    </template>

    <template #actions>
      <v-btn
        density="compact"
        variant="text"
        color="primary"
        class="text-primary text-sm rounded-lg mt-4"
        @click="() => $router.push('/signup')"
        size="large"
      >
        Нет аккаунта? Зарегистрируйтесь
      </v-btn>
    </template>
  </AuthLayout>
</template>
<script setup lang="ts">
import { AuthLayout, LoginForm } from '@/modules/auth';
</script>
