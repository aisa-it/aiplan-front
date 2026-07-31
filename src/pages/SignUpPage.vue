<template>
  <LoginLayout>
    <template #title>Регистрация</template>

    <template #default>
      <LoginForm is-register/>
    </template>

    <template #actions>
      <v-btn
        density="compact"
        variant="text"
        color="primary"
        class="text-primary text-sm rounded-none mt-2"
        @click="() => $router.push('/signin')"
        size="large"
      >
        Уже есть аккаунт? Войдите
      </v-btn>
    </template>
  </LoginLayout>
</template>
<script setup lang="ts">
import LoginLayout from '@/layouts/LoginLayout.vue';
import LoginForm from '@/shared/LoginForm.vue'

</script>
