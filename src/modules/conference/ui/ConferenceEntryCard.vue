<template>
  <div
    v-show="!loading"
    class="conference-entry-card-wrapper"
    :class="isNight ? 'dark-border' : 'border'"
  >
    <div class="conference-entry-card">
      <ConferenceEntryHeader :is-night="isNight" />

      <ConferenceEntrySubText :is-night="isNight" />

      <ConferenceEntryForm :is-night="isNight" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ConferenceEntryHeader from './ConferenceEntryHeader.vue';
import ConferenceEntrySubText from './ConferenceEntrySubText.vue';
import ConferenceEntryForm from './ConferenceEntryForm.vue';

defineProps<{ loading: boolean; isNight: boolean }>();
</script>

<style scoped lang="scss">
.conference-entry-card-wrapper {
  max-width: 762px;
  width: 100%;
  max-height: 330px;
  border-radius: 16px;
  backdrop-filter: blur(48px);
  padding: 2em;
  background: transparent;

  @media screen and (max-width: 860px) {
    max-width: 640px;
  }
  @media screen and (max-width: 670px) {
    max-width: 440px;
    max-height: 330px;
  }

  @media screen and (max-width: 480px) {
    max-height: 360px;
    max-width: 310px;
  }
}

.border {
  border: 1px solid #dbdbdb;
}
.dark-border {
  border: 1px solid #5e5e5e;
}

.conference-entry-card {
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media screen and (max-width: 670px) {
    gap: 12px;
  }
}
</style>
