<template>
  <q-tooltip
    v-bind="attrs"
    :hide-delay="adaptiveHideDelay"
    :delay="adaptiveDelay"
    @update:model-value="(v) => emits('update:model-value', v)"
    @show="(v) => emits('show', v)"
    @before-show="(v) => emits('before-show', v)"
    @hide="(v) => emits('hide', v)"
    @before-hide="(v) => emits('before-hide', v)"
  >
    <slot />
  </q-tooltip>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Screen } from 'quasar';

const attrs = useAttrs();
const emits = defineEmits<{
  'update:model-value': [value: boolean];
  show: [evt: Event];
  'before-show': [evt: Event];
  hide: [evt: Event];
  'before-hide': [evt: Event];
}>();

const isMobile = computed(() => Screen.width <= 650);

const adaptiveHideDelay = computed(()=> {
  return isMobile.value ? 1000 : attrs.hideDelay ? Number(attrs.hideDelay) : 0
})
const adaptiveDelay = computed(()=> {
  return isMobile.value ? 500 : 0
})
</script>
