<template>
  <q-input
    label="Дата окончания"
    class="base-input"
    dense
    :model-value="`${localRange.from}-${localRange.to}`"
    @update:model-value="onInputChange"
    mask="##.##.####-##.##.####"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="localRange"
            range
            mask="DD.MM.YYYY"
            :min="minDate"
            :max="maxDate"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Закрыть" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps<{
  modelValue: { from: string; to: string };
}>();
const emit = defineEmits(['update:modelValue']);

const minDate = dayjs().tz('UTC').format('DD.MM.YYYY');
const maxDate = dayjs()
  .tz('UTC')
  .add(10, 'year')
  .endOf('year')
  .format('DD.MM.YYYY');

const localRange = computed({
  get: () => {
    const val = props.modelValue;

    if (typeof val === 'string') {
      return { from: val, to: '' };
    }

    return {
      from: val?.from ?? '',
      to: val?.to ?? '',
    };
  },
  set: (val) => emit('update:modelValue', val),
});

function onInputChange(value: string | number | null) {
  const input = String(value ?? '');
  const [from, to] = input.split('-').map((v) => v.trim());
  emit('update:modelValue', { from, to });
}
</script>
