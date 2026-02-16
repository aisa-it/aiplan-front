<template>
  <div class="conference-entry-header">
    <img :src="logo" style="width: 190px; overflow: visible" />
    <span :class="isNight ? 'conference-night-text' : 'conference-text'"
      >Конференция</span
    >
  </div>
</template>

<script setup lang="ts">
import logo from 'src/assets/logo.svg';

defineProps<{
  isNight: boolean;
}>();
</script>

<style scoped lang="scss">
.conference-entry-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;

  @media screen and (max-width: 670px) {
    flex-direction: column;
  }

  img {
    width: 190px;
    overflow: visible;
  }

  span {
    font-weight: 500;
    font-style: Medium;
    font-size: 43px;
    line-height: 100%;
    letter-spacing: 0.25px;
    text-align: center;
    vertical-align: middle;

    @media screen and (max-width: 480px) {
      font-size: 34px;
    }
  }
}

.conference-text {
  color: #474a52;
}
.conference-night-text {
  color: #bac4d5;
}
</style>
