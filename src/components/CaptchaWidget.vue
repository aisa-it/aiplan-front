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
import { ALTCHA_RUS } from 'src/constants/constants';

defineEmits<{ verified: [payload: any] }>();
</script>

<style scoped lang="scss">
:deep(.altcha) {
  border: none;
}
</style>
