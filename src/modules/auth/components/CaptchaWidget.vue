<template>
  <altcha-widget
    challenge="/api/captcha/"
    configuration='{"hideFooter":true,"hideLogo":true}'
    language="ru"
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
import 'altcha/i18n/ru';

defineEmits<{ verified: [payload: any] }>();
</script>

<style scoped lang="scss">
altcha-widget {
  --altcha-border-width: 0;
  --altcha-color-primary: rgb(var(--v-theme-primary));
  --altcha-color-success: rgb(var(--v-theme-primary));
}
</style>
