<template>
  <div
    v-show="!loading"
    class="w-full max-w-[762px] max-h-[330px] rounded-2xl backdrop-blur-[48px] p-8 bg-transparent max-[860px]:max-w-[640px] max-[670px]:max-w-[440px] max-[670px]:max-h-[330px] max-[480px]:max-h-[360px] max-[480px]:max-w-[310px] border"
    :class="isNight ? 'border-[#5e5e5e]' : 'border-[#dbdbdb]'"
  >
    <div class="flex flex-col gap-6 max-[670px]:gap-3">
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
