<template>
  <AuthLayout>
    <template #title>{{ t('auth.signUp.title') }}</template>

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
        {{ t('auth.signUp.hasAccount') }}
      </v-btn>
    </template>
  </AuthLayout>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AuthLayout, LoginForm } from '@/modules/auth';

const { t } = useI18n();
</script>
