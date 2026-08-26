<template>
  <q-btn
    no-wrap
    no-caps
    :class="`btn-sm ${Screen.width < 451 ? 'full-w' : ''}`"
    :disable="disable"
  >
    <div class="row justify-between centered-horisontally no-wrap">
      <CalendarIcon :width="24" :height="24" style="margin-right: 6px" />
      <span>{{ formattedValue || 'Не заполнено' }}</span>
    </div>

    <q-popup-proxy
      v-if="!disable"
      cover
      transition-show="scale"
      transition-hide="scale"
      @before-show="initProxy"
    >
      <div class="date-block">
        <div class="date-block__calendar q-px-md q-py-sm row items-center">
          <q-date v-model="proxyDate" :locale="LOCALE_DATE" mask="YYYY-MM-DD" />
          <q-time
            v-if="type === 'datetime'"
            v-model="proxyTime"
            mask="HH:mm"
            format24h
          />
        </div>

        <div
          class="date-block__buttons row items-center no-wrap q-px-md q-py-sm"
        >
          <q-btn
            label="Сброс"
            class="secondary-btn full-w"
            style="font-size: 12px"
            flat
            @click="reset"
            v-close-popup
          />
          <q-btn
            label="Установить"
            class="primary-btn full-w q-ml-sm"
            style="font-size: 12px"
            flat
            :disable="!proxyDate"
            @click="save"
            v-close-popup
          />
        </div>
      </div>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { Screen } from 'quasar';

import { LOCALE_DATE } from 'src/constants/locale';
import CalendarIcon from 'src/components/icons/CalendarIcon.vue';

const props = defineProps<{
  modelValue: string | null;
  type: 'date' | 'datetime';
  disable?: boolean;
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

// внутреннее состояние попапа: дата и (для datetime) время
const proxyDate = ref<string | null>(null);
const proxyTime = ref<string>('00:00');

// значение контракта:
// date — строка YYYY-MM-DD, datetime — unix time в секундах строкой
const formattedValue = computed<string>(() => {
  const value = props.modelValue;
  if (!value) return '';

  if (props.type === 'datetime') {
    const parsed = dayjs.unix(Number(value));
    if (!parsed.isValid()) return String(value);
    // время в локальной зоне пользователя, оффсет зоны в скобках
    return `${parsed.format('DD.MM.YYYY HH:mm')} (UTC${dayjs().format('Z')})`;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : String(value);
});

// инициализация попапа из modelValue; пустое значение — сегодня/сейчас
const initProxy = () => {
  const value = props.modelValue;

  if (props.type === 'datetime') {
    const initial =
      value && dayjs.unix(Number(value)).isValid()
        ? dayjs.unix(Number(value))
        : dayjs();
    proxyDate.value = initial.format('YYYY-MM-DD');
    proxyTime.value = initial.format('HH:mm');
    return;
  }

  const initial = value && dayjs(value).isValid() ? dayjs(value) : dayjs();
  proxyDate.value = initial.format('YYYY-MM-DD');
};

const save = () => {
  if (!proxyDate.value) return;

  if (props.type === 'datetime') {
    // локальные дата и время → unix time в секундах строкой
    const combined = dayjs(`${proxyDate.value} ${proxyTime.value || '00:00'}`);
    emits('update:modelValue', String(combined.unix()));
    return;
  }

  emits('update:modelValue', proxyDate.value);
};

const reset = () => {
  emits('update:modelValue', null);
};
</script>

<style scoped lang="scss">
.date-block__calendar {
  gap: 16px;
  flex-wrap: nowrap;
}

@media screen and (width < 662px) {
  .date-block {
    &__calendar {
      flex-direction: column;
    }
  }
}
</style>
