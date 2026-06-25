<template>
  <q-select
    v-if="status"
    ref="selectStatusRef"
    :label="label || undefined"
    :disable="isDisabled"
    v-model="open"
    no-wrap
    no-caps
    :options="items"
    :option-label="(v) => v.name"
    :option-value="(v) => v.id"
    :class="`${issue ? 'base-selector-sm' : 'base-selector'} ${isAdaptiveSelect ? 'adaptive-select' : ''}`"
    :style="{ width: isAdaptiveSelect ? '' : '160px' }"
    dense
    @popup-show="emits('popup-show')"
    @popup-hide="emits('popup-hide')"
  >
    <template v-slot:no-option>
      <div
        v-if="loading"
        class="row justify-center items-center q-pa-sm"
      >
        <q-spinner color="primary" size="24px" />
      </div>
      <div
        v-else-if="error"
        class="q-pa-md text-center text-white"
      >
        {{ error }}
      </div>
    </template>
    <template v-slot:option="scope">
      <q-item
        clickable
        v-close-popup
        :key="scope.opt.id"
        class="word-wrap"
        @click="emits('update:status', scope.opt)"
      >
        <q-item-section>
          <div class="full-w" style="display: flex; align-items: center">
            <q-badge
              rounded
              class="q-mr-sm"
              :style="{ backgroundColor: scope.opt.color }"
              style="height: 12px; width: 12px"
            /><span class="word-wrap" style="width: 95%">
              {{ scope.opt.name }}
            </span>
          </div>
        </q-item-section>
        <q-item-section side v-if="scope.opt.id === status.id" class="q-ml-sm">
          <q-icon name="done" />
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
      >
        <q-badge
          rounded
          style="margin-right: 8px"
          :style="{ backgroundColor: status.color }"
        />{{ status.name }}
      </div>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
import type { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineOptions({
  name: 'SelectStatus',
});

const props = defineProps<{
  status?: {
    id?: string;
    color?: string;
    name?: string;
  };
  items?: DtoStateLight[];
  issue?: unknown;
  isAdaptiveSelect?: boolean;
  isDisabled?: boolean;
  label?: string;
  loading?: boolean;
  error?: string;
}>();

const emits = defineEmits<{
  'update:status': [DtoStateLight];
  'popup-show': [];
  'popup-hide': [];
}>();

const open = ref();

const selectStatusRef = ref();
useResizeObserverSelect(selectStatusRef);

watch(
  () => props.status,
  () => (open.value = props.status),
);
</script>
