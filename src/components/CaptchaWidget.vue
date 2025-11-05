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
<script lang="ts">
import { defineComponent } from 'vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import 'altcha';
import { ALTCHA_RUS } from 'src/constants/constants';

export default defineComponent({
  name: 'CaptchaWidget',
  emits: ['verified'],
  setup() {
    const api = useAiplanStore();
    return {
      api,
      ALTCHA_RUS,
    };
  },
});
</script>

<style scoped lang="scss">
:deep(.altcha) {
  border: none;
}
</style>
