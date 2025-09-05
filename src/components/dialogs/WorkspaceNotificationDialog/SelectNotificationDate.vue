<template>
  <q-btn
    no-wrap
    no-caps
    :class="`btn bordered ${Screen.width < 451 ? 'full-w' : ''} ${
      isError ? 'error-btn' : ''
    }`"
    :disable="isDisabled"
  >
    <div class="row justify-start centered-horisontally no-wrap">
      <CalendarIcon :width="24" :height="24" style="margin-right: 6px" />
      <span>{{ date ? formatDateTime(date) : 'Дата и время отправки' }}</span>
    </div>

    <q-popup-proxy
      ref="popupDate"
      @before-show="updateProxy"
      transition-show="scale"
      transition-hide="scale"
      class="q-px-md q-pt-md"
      style="min-width: fit-content !important"
    >
      <div class="notification-date__popup">
        <ErrorWrapper
          :is-error="inputTime?.hasError"
          error-message="Время не может быть меньше текущего"
        >
          <div class="input-section">
            <q-input
              dense
              :model-value="formatDate(proxyDate)"
              class="base-input col-5"
              readonly
            />
            <q-input
              dense
              placeholder="ЧЧ:ММ"
              v-model="proxyTime"
              ref="inputTime"
              class="base-input col-5"
              mask="##:##"
              fill-mask="-"
              no-error-icon
              :rules="[isValidTime]"
              @blur="fixTime"
              hide-bottom-space
            />
          </div>
        </ErrorWrapper>
        <q-date
          :years-in-month-view="false"
          v-model="proxyDate"
          :locale="LOCALE_DATE"
          :options="optionsFn"
          minimal
          mask="YYYY-MM-DD"
          class="q-pb-none"
          :navigation-min-year-month="minYearMonth"
          :navigation-max-year-month="maxYearMonth"
        >
          <div class="row items-center no-wrap">
            <q-btn
              label="Отменить"
              class="secondary-btn col-6"
              style="font-size: 12px"
              flat
              v-close-popup
            />
            <q-btn
              label="Установить"
              class="primary-btn col-6 q-ml-sm"
              style="font-size: 12px"
              flat
              @click="save"
              :disable="inputTime?.hasError"
            />
          </div>
        </q-date>
      </div>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
//core
import { ref, watchEffect } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import { QInput, QPopupProxy, Screen } from 'quasar';
//utils
import { formatDate, formatDateTime } from 'src/utils/time';

//constants
import { LOCALE_DATE } from 'src/constants/locale';

//components
import CalendarIcon from 'src/components/icons/CalendarIcon.vue';
import ErrorWrapper from 'src/components/errors/ErrorWrapper.vue';

//TODO это общий компонент, необходимо вынести его в соответствующую директорию и сделать ренейм
const props = withDefaults(
  defineProps<{
    date?: string;
    isDisabled?: boolean;
    isError?: boolean;
    minYearMonth?: string;
    maxYearMonth?: string;
  }>(),
  {
    minYearMonth: () => `${dayjs(new Date()).year()}/01`,
    maxYearMonth: () => `${dayjs(new Date()).year() + 10}/12`,
  },
);
const emits = defineEmits<{
  'update:date': [value: string | null | Dayjs];
  'clear-error': [];
}>();

const proxyDate = ref(dayjs(new Date()).format('YYYY-MM-DD'));
const proxyTime = ref('00:00');
const inputTime = ref<QInput | null>();
const popupDate = ref<QPopupProxy | null>();
const isValidTime = () => {
  const selectedDateTime = dayjs(
    `${proxyDate.value} ${proxyTime.value}`,
    'YYYY-MM-DD HH:mm',
  );
  const now = dayjs();
  return (
    selectedDateTime.isAfter(now) || selectedDateTime.isSame(now, 'minute')
  );
};

const optionsFn = (date: string) => {
  return date >= dayjs(new Date()).format('YYYY/MM/DD');
};

const fixTime = () => {
  let [hours, minutes] = proxyTime.value.split(':');
  if (isNaN(+hours) || +hours > 23) hours = '00';
  if (isNaN(+minutes) || +minutes > 59) minutes = '00';
  proxyTime.value = `${hours}:${minutes}`;
};

const updateProxy = () => {
  proxyDate.value = props.date
    ? dayjs(props.date).format('YYYY-MM-DD')
    : dayjs(new Date()).format('YYYY-MM-DD');
  proxyTime.value = props.date
    ? dayjs(props.date).format('HH:mm')
    : dayjs(new Date()).format('HH:mm');
  emits('clear-error');
};

const save = () => {
  if (!inputTime.value?.validate()) return;
  emits(
    'update:date',
    dayjs(`${proxyDate.value} ${proxyTime.value}`, 'YYYY-MM-DD HH:mm'),
  );
  popupDate.value?.hide();
};

watchEffect(() => {
  if (!proxyDate.value) updateProxy();
});

defineExpose({ isValidTime });
</script>

<style scoped lang="scss">
.q-date {
  box-shadow: none;
  width: 304px;
}
.notification-date__popup {
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
}
.input-section {
  display: flex;
  gap: 12px;
}
.input-section .base-input {
  width: 146px;
}

.error-btn {
  border-color: $negative;
}
</style>
