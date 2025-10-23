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

const props = defineProps<{
  modelValue: { from: string; to: string };
}>();
const emit = defineEmits(['update:modelValue']);

const minDate = dayjs().format('DD.MM.YYYY');
const maxDate = dayjs().add(10, 'year').endOf('year').format('DD.MM.YYYY');

const localRange = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

function onInputChange(value: string | number | null) {
  const input = String(value ?? '');
  const [from, to] = input.split('-').map((v) => v.trim());
  emit('update:modelValue', { from, to });
}
</script>
