<template>
  <AuthLayout>
    <template #title>{{ t('auth.signIn.title') }}</template>

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
        {{ t('auth.signIn.noAccount') }}
      </v-btn>
    </template>
  </AuthLayout>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AuthLayout, LoginForm } from '@/modules/auth';

const { t } = useI18n();
</script>
