<template>
  <q-input
    label="Дата окончания"
    class="base-input"
    dense
    :model-value="`${dateRange.from}-${dateRange.to}`"
    @update:model-value="onInputChange"
    mask="##.##.####-##.##.####"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="dateRange"
            range
            mask="DD.MM.YYYY"
            :min="minYearMonth"
            :max="maxYearMonth"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';
import dayjs from 'dayjs';

const props = defineProps<{
  modelValue: { from: string; to: string };
}>();
const emit = defineEmits(['update:modelValue']);

const dateRange = ref({ ...props.modelValue });

const maxYearMonth = `${dayjs().year() + 10}/12`;
const minYearMonth = `${dayjs().year()}/01`;

watch(
  () => dateRange.value,
  (val) => {
    emit('update:modelValue', val);
  },
  { deep: true },
);

watch(
  () => props.modelValue,
  (val) => {
    dateRange.value = { ...val };
  },
  { deep: true },
);

function onInputChange(value: string | number | null) {
  const input = String(value ?? '');
  const [from, to] = input.split('-').map((v) => v.trim());
  dateRange.value = { from, to };
}
onMounted(() => {
  dateRange.value = { ...props.modelValue };
});
</script>
