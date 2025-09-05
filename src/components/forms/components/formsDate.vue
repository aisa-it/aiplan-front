<template>
  <div class="q-mb-sm">
    <q-input
      v-model="computedValue"
      ref="dataInput"
      dense
      label="Дата окончания"
      class="base-input"
      mask="##.##.####"
      :rules="[rules]"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            ref="popupProxy"
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="computedValue"
              :options="minDate"
              mask="DD.MM.YYYY"
              :navigation-max-year-month="maxYearMonth"
              :navigation-min-year-month="minYearMonth"
            >
              <div class="row items-center no-wrap">
                <q-btn
                  label="Сбросить"
                  class="secondary-btn full-w q-mr-sm"
                  no-caps
                  flat
                  dense
                  @click="emits('reset')"
                />
                <q-btn
                  v-close-popup
                  label="Выбрать"
                  class="primary-btn full-w"
                  no-caps
                  flat
                  dense
                />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { minDate } from '../helper/helperForm';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  rules: object;
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string];
  reset: [];
}>();

const maxYearMonth = `${dayjs(new Date()).year() + 10}/12`;
const minYearMonth = `${dayjs(new Date()).year()}/01`;

const computedValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val.split('T')[0]),
});
</script>
