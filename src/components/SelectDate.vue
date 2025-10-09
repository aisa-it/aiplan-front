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
      <span v-if="!currentIssueID && viewProps.props?.issueView === 'kanban'">{{
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
          <q-time v-model="proxyDate" mask="YYYY-MM-DDTHH:mm:ss" format24h />
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
            @click="save"
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
          <q-time v-model="proxyDate" mask="YYYY-MM-DDTHH:mm:ss" format24h />
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
            @click="save"
            v-close-popup
          />
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

import { useAiplanStore } from 'src/stores/aiplan-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

import CalendarIcon from './icons/CalendarIcon.vue';
import { LOCALE_DATE } from 'src/constants/locale';
import { formatDateTime } from '../utils/time';

export default defineComponent({
  name: 'SelectDate',
  props: {
    workspaceId: {
      type: String,
      required: true,
    },
    projectid: {
      type: String,
      required: true,
    },
    issueid: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: false,
    },
    issue: {
      type: Object,
      required: false,
    },
    newIssue: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    minYearMonth: {
      type: String,
      required: false,
      default: `${dayjs(new Date()).year()}/01`,
    },
    maxYearMonth: {
      type: String,
      required: false,
      default: `${dayjs(new Date()).year() + 10}/12`,
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Не установлен',
    },
  },
  emits: ['refresh', 'update:date'],
  components: { CalendarIcon },
  setup(props, { emit }) {
    const api = useAiplanStore();
    const viewProps = useViewPropsStore();
    const issueStore = useSingleIssueStore();
    const { setNotificationView } = useNotificationStore();
    const { currentIssueID } = storeToRefs(issueStore);
    const open = ref(false);

    const proxyDate = ref<string | null>(null);
    const minutes = [...Array(60)].map((_, i) => i);
    const hours = [...Array(24)].map((_, i) => i);
    const selectedHour = ref<number>(12);
    const selectedMinute = ref<number>(30);

    const optionsFn = (date: string): boolean => {
      return date >= dayjs(new Date()).format('YYYY/MM/DD');
    };

    return {
      api,
      open,
      Screen,
      viewProps,
      proxyDate,
      currentIssueID,
      selectedHour,
      selectedMinute,
      minutes,
      hours,
      optionsFn,
      formatDateTime,
      updateProxy() {
        proxyDate.value = props.date
          ? dayjs.utc(props.date).local().format('YYYY-MM-DDTHH:mm:ss')
          : dayjs().format('YYYY-MM-DDTHH:mm:ss');
      },

      save() {
        const targetDateValue = proxyDate.value
          ? dayjs(proxyDate.value).toISOString()
          : null;
        if (props.issueid) {
          api
            .issuePartialUpdate(
              props.workspaceId,
              props.projectid,
              props.issueid,
              {
                target_date: targetDateValue,
              },
            )
            .then(() => {
              setNotificationView({ type: 'success', open: true });
              emit('refresh');
            });
        } else {
          emit('update:date', targetDateValue);
        }
      },
      LOCALE_DATE,
    };
  },
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
  flex-wrap: wrap;
}

@media screen and (width < 662px) {
  .date-block {
    &__calendar {
      flex-direction: column;
    }
  }
}
</style>
