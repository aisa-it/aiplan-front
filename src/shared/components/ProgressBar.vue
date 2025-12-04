<template>
  <div class="progress-bar">
    <span class="progress-bar__count">
      {{
        `${props.currentValue} ${props.units} из ${props.maxValue} ${props.units}`
      }}
    </span>
    <q-linear-progress
      class="progress-bar__bar"
      :value="props.currentValue / props.maxValue"
      size="sm"
      animationSpeed="200"
      :color="props.currentValue >= props.maxValue ? 'negative' : 'positive'"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentValue: number;
    maxValue: number;
    units?: string;
  }>(),
  {
    units: '',
  },
);
</script>

<style scoped lang="scss">
.progress-bar {
  &__count {
    display: block;
    margin-bottom: 4px;
  }
}
</style>
