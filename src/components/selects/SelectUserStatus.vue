<template>
  <UserStatus
    :status="user.status || durationLabelMap[value.status] || 'Выбрать статус'"
    :statusEmoji="user.status_emoji"
    :status-end-time="user.status_end_date"
    ref="triggerRef"
  />
  <q-popup-proxy
    v-model="showPopup"
    :target="anchorEl"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card style="min-width: 350px; max-width: 95vw">
      <q-form @submit="onSave" @reset="clearForm" ref="formRef">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Выбрать статус</div>
        </q-card-section>
        <q-card-section class="q-pb-none q-pt-xs q-pb-sm">
          <q-select
            v-model="value.status"
            :options="
              statusOptions.map((opt) => {
                return { ...opt, label: opt.emoji + ' ' + opt.label };
              })
            "
            class="base-selector"
            label="Статус"
            emit-value
            map-options
            dense
            :rules="[
              (val) => {
                if (val === 'none' || !!val) return true;
                return 'Выберите статус';
              },
            ]"
            hide-bottom-space
            lazy-rules
          />
        </q-card-section>
        <q-card-section
          v-if="value.status != 'none'"
          class="q-pb-none q-pt-xs q-pb-sm"
        >
          <q-input
            v-if="value.status === 'custom'"
            v-model="value.customStatusText"
            label="Текст статуса"
            dense
            maxlength="50"
            class="q-mt-sm base-textarea"
            hide-bottom-space
            lazy-rules
            :rules="[
              (val) =>
                !value.status ||
                value.status !== 'custom' ||
                !!val ||
                'Введите текст своего статус',
            ]"
          />
          <q-select
            class="q-mt-md base-selector"
            v-model="value.selectEndDate"
            :options="durationOptions"
            :rules="[(val) => !!val || 'Выберите длительность']"
            label="Сбросить статус через"
            lazy-rules
            emit-value
            map-options
            dense
            hide-bottom-space
          />

          <div
            v-if="value.selectEndDate === 'custom'"
            class="row q-col-gutter-sm q-mt-sm"
          >
            <div class="col">
              <q-input
                v-model="value.customDate"
                :rules="[
                  (val) => !!val || 'Введите дату в формате ДД.ММ.ГГГГ',
                  (val) => isDateNotInPast(val),
                ]"
                :placeholder="`ДД.ММ.ГГГГ`"
                mask="##.##.####"
                dense
                label="Дата"
                class="base-textarea"
                ref="dateInput"
                hide-bottom-space
                lazy-rules
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="value.customDate"
                        :options="minDate"
                        :navigation-max-year-month="maxYearMonth"
                        :navigation-min-year-month="minYearMonth"
                        mask="DD.MM.YYYY"
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Закрыть"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-input
                ref="timeInput"
                class="base-textarea"
                v-model="value.customTime"
                :rules="[
                  (val) => !!val || 'Укажите время',
                  (val) => {
                    const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
                    return isValidTime || 'Введите корректное время (ЧЧ:мм)';
                  },
                  (val) =>
                    (value.customDate &&
                      isTimeNotInPast(val, value.customDate)) ||
                    'Время не может быть в прошлом',
                ]"
                label="Время"
                mask="##:##"
                fill-mask="--:--"
                lazy-rules
                dense
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-icon name="schedule" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Отменить"
            class="secondary-btn"
            color="primary"
            style="flex: 1"
            type="reset"
          />
          <q-btn
            label="Сохранить"
            color="primary"
            class="primary-btn"
            style="flex: 1"
            type="submit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-popup-proxy>
</template>

<script setup lang="ts">
//core
import { storeToRefs } from 'pinia';
import { computed, reactive, ref, watch, nextTick } from 'vue';
//stores
import { useUserStore } from 'src/stores/user-store';
//utils
import { isDateNotInPast, isTimeNotInPast } from 'src/utils/validation';
//components
import UserStatus from './components/UserStatus.vue';
import dayjs from 'dayjs';

const userStatusDict = {
  none: { label: 'Без статуса', value: 'none', emoji: '' },
  dnd: { label: 'Не беспокоить', value: 'dnd', emoji: '🔕' },
  lunch: { label: 'Обед', value: 'lunch', emoji: '🍽️' },
  call: { label: 'На звонке', value: 'call', emoji: '🎧' },
  vacation: { label: 'Отпуск', value: 'vacation', emoji: '🏖️' },
  sick: { label: 'Больничный', value: 'sick', emoji: '🤒' },
  custom: { label: 'Другое', value: 'custom', emoji: '💬' },
} as const;

const userStatusDurationDict = {
  forever: { label: 'Без срока', value: 'forever' },
  halfHour: { label: '30 минут', value: 'halfHour' },
  oneHour: { label: '1 час', value: 'oneHour' },
  today: { label: 'Сегодня', value: 'today' },
  week: { label: 'Эта неделя', value: 'week' },
  custom: { label: 'Выбрать дату и время', value: 'custom' },
} as const;

//stores
const userStore = useUserStore();

//storeToRefs
const { user } = storeToRefs(userStore);

//state
const showPopup = ref(false);
const triggerRef = ref<any>(null);
const value = reactive({
  status: user.value?.status || userStatusDict.none.value,
  statusEmoji: user.value?.status_emoji || '',
  statusEndDate: user.value?.status_end_date || null,
  selectEndDate: '',
  customStatusText: '',
  customDate: '',
  customTime: '',
});
const formRef = ref();
const isFormValid = ref(false);
//computed
const anchorEl = computed(() => {
  return triggerRef.value?.$el || triggerRef.value || null;
});

//constants
const statusOptions = Object.entries(userStatusDict).map(
  ([value, { label, emoji }]) =>
    ({
      label,
      value,
      emoji,
    }) as const,
);

const durationOptions = Object.entries(userStatusDurationDict).map(
  ([value, { label }]) =>
    ({
      label,
      value,
    }) as const,
);

const durationLabelMap = Object.fromEntries(
  durationOptions.map((opt) => [opt.value, opt.label]),
);

const maxYearMonth = `${dayjs(new Date()).year() + 10}/12`;
const minYearMonth = `${dayjs(new Date()).year()}/01`;

//methods
const minDate = (date: string) => {
  return date >= dayjs(new Date()).format('YYYY/MM/DD');
};

const clearForm = () => {
  value.status = userStatusDict.none.value;
  value.statusEmoji = '';
  value.statusEndDate = null;
  value.selectEndDate = '';
  value.customStatusText = '';
  value.customDate = '';
  value.customTime = '';
};

const handleUpdateUser = async () => {
  await userStore.updateCurrentUser({
    status: value.status === userStatusDict.none.value ? '' : value.status,
    status_emoji: value.statusEmoji,
    status_end_date: value.statusEndDate as string | undefined,
  });
};

const handleStatus = () => {
  if (value.status === userStatusDict.none.value) return clearForm();

  const statusData =
    userStatusDict[value.status as keyof typeof userStatusDict];

  if (!statusData) return;

  value.statusEmoji = statusData.emoji;
  value.status =
    statusData.value === userStatusDict.custom.value
      ? value.customStatusText
      : statusData.label;
};

const handleEndDateSelection = () => {
  if (value.selectEndDate === userStatusDurationDict.custom.value) {
    const [day, month, year] = value.customDate.split('.');
    const [hours, minutes] = value.customTime.split(':');
    const customDateObj = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
    );
    value.statusEndDate = customDateObj.toISOString();
  } else {
    console.log('endDate', value.selectEndDate);
    switch (value.selectEndDate) {
      case userStatusDurationDict.forever.value:
        value.statusEndDate = null;
        break;
      case userStatusDurationDict.halfHour.value:
        value.statusEndDate = new Date(
          Date.now() + 30 * 60 * 1000,
        ).toISOString();
        break;
      case userStatusDurationDict.oneHour.value:
        value.statusEndDate = new Date(
          Date.now() + 60 * 60 * 1000,
        ).toISOString();
        break;
      case userStatusDurationDict.today.value:
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        value.statusEndDate = today.toISOString();
        break;
      case userStatusDurationDict.week.value:
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        value.statusEndDate = nextWeek.toISOString();
        break;
      default:
        value.statusEndDate = null;
        break;
    }
  }
};
const validateForm = async (shouldFocus = true) => {
  if (formRef.value) {
    isFormValid.value = await formRef.value.validate(shouldFocus);
  }
};

const onSave = async () => {
  handleStatus();
  handleEndDateSelection();

  await nextTick();
  await validateForm();

  if (!isFormValid.value) return;
  else await handleUpdateUser();
  showPopup.value = false;
};

//lifecycle hooks
watch(
  () => user.value.status,
  (newStatus) => {
    if (newStatus) {
      value.status = newStatus || '';
    }
  },
  { immediate: true },
);

watch(
  () => user.value?.status_emoji,
  (newEmoji) => {
    if (newEmoji) {
      value.statusEmoji = newEmoji || '';
    }
  },
  { immediate: true },
);

watch(
  () => user.value?.status_end_date,
  (newEndDate) => {
    if (newEndDate) {
      value.statusEndDate = newEndDate || null;
    }
  },
  { immediate: true },
);
</script>
