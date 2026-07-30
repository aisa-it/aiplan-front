<template>
  <altcha-widget
    :challengeurl="`/api/captcha/`"
    hidefooter
    hidelogo
    :strings="JSON.stringify(ALTCHA_RUS)"
    style="--altcha-width: 300px"
    auto="onload"
    workers="12"
    expires="3600000"
    @verified="
      (p: any) => {
        $emit('verified', p?.detail?.payload);
      }
    "
  ></altcha-widget>
</template>

<script setup lang="ts">
import 'altcha';

const ALTCHA_RUS = {
  error: 'Проверка провалилась. Попробуйте позже.',
  footer: '',
  label: 'Я не робот',
  verified: 'Проверено',
  verifying: 'Проверка...',
  waitAlert: 'Проверка... пожалуйста подождите.',
};

defineEmits<{ verified: [payload: any] }>();
</script>

<style scoped lang="scss">
:deep(.altcha) {
  border: none;
}
</style>
