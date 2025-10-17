<template>
  <div class="progress-w full-w">
    <div style="bottom: 9px; position: absolute; width: 100%">
      <div class="row centered-horisontally justify-center">
        <q-badge
          class="progress-badge"
          :label="`Выполнено ${Math.round(done * 100)}%`"
        />
      </div>
    </div>
    <div class="progressbar row no-wrap items-stretch">
      <div
        v-if="cancelled()"
        class="line-wrapper"
        :style="`width: ${cancelled()}%`"
      >
        <div class="error-line" style="width: 100%">
          {{ '' }}
        </div>
      </div>
      <div
        v-if="completed()"
        class="line-wrapper"
        :style="`width: ${completed()}%`"
      >
        <div class="success-line" style="width: 100%">
          {{ '' }}
        </div>
      </div>
      <div
        v-if="started()"
        class="line-wrapper"
        :style="`width: ${started()}%`"
      >
        <div class="primary-line" style="width: 100%">{{ '' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  issues: any[];
  stateDistribution: Record<string, number>;
}>();

const done = computed(() => calculateSum(['completed', 'cancelled']));
function calculateSum(keys: string[]) {
  return (
    Object.entries(props.stateDistribution).reduce(function (acc, cur) {
      const [key, value] = cur;
      if (keys.includes(key)) {
        return acc + value;
      }
      return acc;
    }, 0) / props.issues.length
  );
}
const started = () => {
  return calculateSum(['started']) * 100;
};

const completed = () => {
  return calculateSum(['completed']) * 100;
};

const cancelled = () => {
  return calculateSum(['cancelled']) * 100;
};
</script>

<style scoped lang="scss">
.progress-w {
  position: relative;
  border-radius: 8px;
}

@media screen and (max-width: 600px) {
  .progress-w {
    width: 100% !important;
  }
}
</style>
