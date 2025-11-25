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
        v-if="in_progress()"
        class="line-wrapper"
        :style="`width: ${in_progress()}%`"
      >
        <div class="primary-line" style="width: 100%">{{ '' }}</div>
      </div>
      <div
        v-if="pending()"
        class="line-wrapper"
        :style="`width: ${pending()}%`"
      >
        <div class="base-line" style="width: 100%">{{ '' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TypesSprintStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed } from 'vue';

const props = defineProps<{
  stats: TypesSprintStats;
}>();

const done = computed(() => calculateSum(['completed', 'cancelled']));
function calculateSum(keys: string[]) {
  return (
    Object.entries(props.stats).reduce(function (acc, cur) {
      const [key, value] = cur;
      if (keys.includes(key)) {
        return acc + value;
      }
      return acc;
    }, 0) / (props.stats.all_issues ?? 1)
  );
}
const in_progress = () => {
  return calculateSum(['in_progress']) * 100;
};

const completed = () => {
  return calculateSum(['completed']) * 100;
};

const cancelled = () => {
  return calculateSum(['cancelled']) * 100;
};

const pending = () => {
  return calculateSum(['pending']) * 100;
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
