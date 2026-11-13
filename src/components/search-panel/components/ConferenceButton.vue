<template>
  <v-btn
    v-if="isEnabledJitsi"
    icon
    variant="text"
    :ripple="false"
    class="header-icon-btn"
    @click="$router.push('/conf')"
  >
    <ConferenceIcon />
    <v-tooltip activator="parent" location="bottom">Конференция</v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ConferenceIcon from '@/components/icons/ConferenceIcon.vue';
import { useUtilsStore } from '@/stores/utils-store';

const { isEnabledJitsi } = storeToRefs(useUtilsStore());
</script>
