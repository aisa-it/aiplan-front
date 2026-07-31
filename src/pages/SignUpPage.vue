<template>
  <AuthLayout>
    <template #title>Регистрация</template>

    <template #default>
      <LoginForm is-register />
    </template>

    <template #actions>
      <v-btn
        density="compact"
        variant="text"
        color="primary"
        class="text-primary text-sm rounded-lg mt-4"
        @click="() => $router.push('/signin')"
        size="large"
      >
        Уже есть аккаунт? Войдите
      </v-btn>
    </template>
  </AuthLayout>
</template>
<script setup lang="ts">
import { AuthLayout, LoginForm } from '@/modules/auth';
</script>
