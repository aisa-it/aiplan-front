<template>
  <div
    v-show="!loading"
    class="w-full max-w-[47.625rem] max-h-[20.625rem] rounded-2xl backdrop-blur-[3rem] p-8 bg-transparent max-[53.75rem]:max-w-[40rem] max-[41.875rem]:max-w-[27.5rem] max-[41.875rem]:max-h-[20.625rem] max-[30rem]:max-h-[22.5rem] max-[30rem]:max-w-[19.375rem] border border-[color:var(--conf-border)]"
  >
    <div class="flex flex-col gap-6 max-[41.875rem]:gap-3">
      <ConferenceEntryHeader />
      <ConferenceEntrySubText />
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
