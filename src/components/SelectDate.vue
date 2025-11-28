<template>
  <q-btn
    no-wrap
    no-caps
    :class="`btn-sm ${newIssue ? 'new-issue-btn' : ''} ${
      Screen.width < 451 ? 'full-w' : ''
    }`"
    :disable="isDisabled"
  >
    <div class="row justify-between centered-horisontally no-wrap">
      <CalendarIcon
        v-if="!newIssue"
        :width="24"
        :height="24"
        style="margin-right: 6px"
      />
      <span v-if="type === 'kanban'">{{
        date ? date.split('T')[0].split('-').reverse().join('.') : 'Срок'
      }}</span>
      <span v-else>{{ date ? formatDateTime(date) : placeholder }}</span>
    </div>

    <q-popup-proxy
      v-if="Screen.width > 662"
      @before-show="updateProxy"
      cover
      transition-show="scale"
      transition-hide="scale"
    >
      <div class="date-block">
        <div class="date-block__calendar q-px-md q-py-sm row items-center">
          <q-date
            v-model="proxyDate"
            :locale="LOCALE_DATE"
            :options="optionsFn"
            mask="YYYY-MM-DDTHH:mm:ss"
            :navigation-min-year-month="minYearMonth"
            :navigation-max-year-month="maxYearMonth"
          />
          <q-time
            v-model="proxyDate"
            :options="timeOptionsFn"
            mask="YYYY-MM-DDTHH:mm:ss"
            format24h
          />
        </div>

        <div
          class="date-block__buttons row items-center no-wrap q-px-md q-py-sm date-buttons"
        >
          <q-btn
            label="Без даты"
            class="secondary-btn full-w"
            style="font-size: 12px"
            flat
            @click="
              () => {
                proxyDate = null;
                save();
              }
            "
            v-close-popup
          />
          <q-btn
            label="Установить"
            class="primary-btn full-w q-ml-sm"
            style="font-size: 12px"
            flat
            @click="save(true)"
            v-close-popup
          />
        </div>
      </div>
    </q-popup-proxy>
    <q-menu
      cover
      max-height="100vh"
      transition-show="scale"
      transition-hide="scale"
      v-else
      @before-show="updateProxy"
    >
      <div class="date-block">
        <div class="date-block__calendar q-px-md q-py-sm row items-center">
          <q-date
            v-model="proxyDate"
            :locale="LOCALE_DATE"
            :options="optionsFn"
            mask="YYYY-MM-DDTHH:mm:ss"
            :navigation-min-year-month="minYearMonth"
            :navigation-max-year-month="maxYearMonth"
          />
          <q-time
            v-model="proxyDate"
            :options="timeOptionsFn"
            mask="YYYY-MM-DDTHH:mm:ss"
            format24h
          />
        </div>

        <div
          class="date-block__buttons row items-center no-wrap q-px-md q-py-sm date-buttons"
        >
          <q-btn
            label="Без даты"
            class="secondary-btn full-w"
            style="font-size: 12px"
            flat
            @click="
              () => {
                proxyDate = null;
                save();
              }
            "
            v-close-popup
          />
          <q-btn
            label="Установить"
            class="primary-btn full-w q-ml-sm"
            style="font-size: 12px"
            flat
            @click="save(true)"
            v-close-popup
          />
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { Screen, useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';

import CalendarIcon from './icons/CalendarIcon.vue';
import { LOCALE_DATE } from 'src/constants/locale';
import { formatDateTime } from '../utils/time';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = withDefaults(
  defineProps<{
    workspaceId: string;
    projectId: string;
    issueId?: string;
    date?: string | null;
    autoUpdate?: boolean;
    issue?: DtoIssue;
    newIssue?: boolean;
    isDisabled?: boolean;
    minYearMonth?: string;
    maxYearMonth?: string;
    placeholder?: string;
    type?: 'kanban' | 'table' | 'issue';
  }>(),
  {
    minYearMonth: `${dayjs(new Date()).year()}/01`,
    maxYearMonth: `${dayjs(new Date()).year() + 10}/12`,
    placeholder: 'Не установлен',
  },
);

const emits = defineEmits<{
  refresh: [date: string | null];
  'update:date': [date: string | null];
}>();

const $q = useQuasar();
const api = useAiplanStore();
const { setNotificationView } = useNotificationStore();

const proxyDate = ref<string | null>(null);

// Тикание часов
interface ClockTimer {
  timeout: ReturnType<typeof setTimeout> | null;
  interval: ReturnType<typeof setInterval> | null;
}

const clockTimer = reactive<ClockTimer>({ timeout: null, interval: null });
const fieldTimer = reactive<ClockTimer>({ timeout: null, interval: null });

function stopTick(timer: ClockTimer): void {
  if (timer.timeout) {
    clearTimeout(timer.timeout);
    timer.timeout = null;
  }
  if (timer.interval) {
    clearInterval(timer.interval);
    timer.interval = null;
  }
}

function scheduleTick(timer: ClockTimer, callback: () => void): void {
  stopTick(timer);
  const now = new Date();
  const nextMinute = new Date(now);
  nextMinute.setSeconds(0, 0);
  nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  const delay = nextMinute.getTime() - now.getTime();

  timer.timeout = setTimeout(() => {
    callback();
    timer.interval = setInterval(callback, 60_000);
  }, delay);
}

// Корректировка времени, если оно было раньше доминимально допустимого
const adjustTime = (): void => {
  if (!proxyDate.value) return;

  const selectedDate = dayjs(proxyDate.value);
  const today = dayjs().startOf('day');

  if (!selectedDate.isSame(today, 'day')) return;

  const expectedTime = dayjs().add(15, 'minute').startOf('minute');
  if (selectedDate.isBefore(expectedTime)) {
    proxyDate.value = expectedTime.format('YYYY-MM-DDTHH:mm:ss');
  }
};

// Обновление даты в поле
const fieldDateUpdate = (): void => {
  adjustTime();
  save();
};

// Выбор допустимой даты
const optionsFn = (date: string): boolean => {
  return date >= dayjs(new Date()).format('YYYY/MM/DD');
};

// Выбор допустимого времени
const timeOptionsFn = (hour: number, minute: number | null): boolean => {
  const currentDate = proxyDate.value ? dayjs(proxyDate.value) : dayjs();
  const today = dayjs().startOf('day');
  const expectedDay = currentDate.startOf('day');

  // Если день не сегодняшний - доступны все часы и минуты
  if (!expectedDay.isSame(today, 'day')) {
    return true;
  }

  // Разрешенное время - не раньше чем через 15 минут после текущей минуты
  const expectedTime = dayjs().add(15, 'minute');
  // Проверка допустимого часа, если минута не указана пользователем
  if (minute === null) {
    // Час доступен для выбора, если его последняя минута позже или равна предполагаемой минуте выбираемого времени
    const hourEnd = currentDate.hour(hour).minute(59).second(59);
    return hourEnd.isAfter(expectedTime) || hourEnd.isSame(expectedTime);
  }

  // Проверка для минуты, позже ли она разрешенного времени
  const expectedMinute = currentDate.hour(hour).minute(minute).second(0);
  return expectedMinute.isAfter(expectedTime);
};

function save(notify: boolean = false): void {
  const targetDateValue = proxyDate.value
    ? dayjs(proxyDate.value).toISOString()
    : null;
  if (props.issueId) {
    api
      .issuePartialUpdate(props.workspaceId, props.projectId, props.issueId, {
        target_date: targetDateValue,
      })
      .then(() => {
        if (notify) setNotificationView({ type: 'success', open: true });
        emits('refresh', proxyDate.value);
      });
  } else {
    emits('update:date', targetDateValue);
  }
}

const updateProxy = () => {
  // Инициализация. Если дата была задана - берем её, в противном случае сразу предлагаем новую допустимую со смещением
  let initialDate = props.date
    ? dayjs.utc(props.date).local()
    : dayjs().add(15, 'minute');

  // Если старая дата вне допустимого диапазона на текущий момент - меняем на допустимую
  if (initialDate.isBefore(dayjs().add(15, 'minute'))) {
    initialDate = dayjs().add(15, 'minute').startOf('minute');
  }

  proxyDate.value = initialDate.format('YYYY-MM-DDTHH:mm:ss');
};

watch(
  () => proxyDate.value,
  () => {
    adjustTime();
  },
);

watch(
  () => $q.appVisible,
  (visible) => {
    if (visible) {
      stopTick(clockTimer);
      adjustTime();
      scheduleTick(clockTimer, adjustTime);
    }
  },
);

watch(
  () => props.autoUpdate,
  (isEnabled) => {
    if (isEnabled) {
      scheduleTick(fieldTimer, fieldDateUpdate);
    } else {
      stopTick(fieldTimer);
    }
  },
  { immediate: true },
);

onMounted(() => {
  scheduleTick(clockTimer, adjustTime);
});

onBeforeUnmount(() => {
  stopTick(clockTimer);
  stopTick(fieldTimer);
});
</script>

<style scoped lang="scss">
.new-issue-btn {
  .q-btn__content {
    justify-content: space-between !important;
  }
}

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
