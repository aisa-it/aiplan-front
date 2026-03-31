<template>
  <q-input
    :model-value="formattedValue"
    :label="label"
    class="base-input"
    mask="##.##.####-##.##.####"
    dense
    @update:model-value="onInputChange"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="internalRange"
            range
            mask="DD.MM.YYYY"
            :min="minDate"
            :max="maxDate"
            today-btn
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

interface DateRange {
  from: string;
  to: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: DateRange | null;
    label?: string;
  }>(),
  {
    label: 'Выберите интервал',
    modelValue: () => ({ from: '', to: '' }),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: DateRange];
}>();

const minDate = dayjs().tz('UTC').format('DD.MM.YYYY');
const maxDate = dayjs()
  .tz('UTC')
  .add(10, 'year')
  .endOf('year')
  .format('DD.MM.YYYY');

const internalRange = computed<DateRange>({
  get: () => {
    if (!props.modelValue) return { from: '', to: '' };
    return {
      from: props.modelValue.from || '',
      to: props.modelValue.to || '',
    };
  },
  set: (val) => {
    emit('update:modelValue', val);
  },
});

const formattedValue = computed<string>(() => {
  return `${props.modelValue?.from || ''}-${props.modelValue?.to || ''}`;
});

function onInputChange(value: string | number | null) {
  const input = String(value ?? '');
  const [from, to] = input.split('-').map((v) => v.trim());
  emit('update:modelValue', { from, to });
}
</script>
