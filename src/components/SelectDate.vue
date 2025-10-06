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
      <span v-else>{{
        date ? date.split('T')[0].split('-').reverse().join('.') : placeholder
      }}</span>
    </div>

    <q-popup-proxy
      @before-show="updateProxy"
      cover
      transition-show="scale"
      transition-hide="scale"
    >
      <q-date
        v-model="proxyDate"
        :locale="LOCALE_DATE"
        :options="optionsFn"
        mask="YYYY-MM-DDTHH:mm:ss"
        :navigation-min-year-month="minYearMonth"
        :navigation-max-year-month="maxYearMonth"
      >
        <div class="row items-center no-wrap">
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
          <!-- <q-btn label="Закрыть" color="primary" flat v-close-popup /> -->
          <q-btn
            label="Установить"
            class="primary-btn full-w q-ml-sm"
            style="font-size: 12px"
            flat
            @click="save"
            v-close-popup
          />
        </div>
      </q-date>
    </q-popup-proxy>
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
    const proxyDate = ref(new Date().toISOString());

    const optionsFn = (date) => {
      return date >= dayjs(new Date()).format('YYYY/MM/DD');
    };

    return {
      api,
      open,
      Screen,
      viewProps,
      proxyDate,
      currentIssueID,
      optionsFn,
      updateProxy() {
        proxyDate.value = props.date
          ? new Date(props.date as string).toISOString()
          : new Date().toISOString();
      },

      save() {
        if (props.issueid) {
          api
            .issuePartialUpdate(
              props.workspaceId,
              props.projectid,
              props.issueid,
              {
                target_date: proxyDate.value,
              },
            )
            .then(() => {
              setNotificationView({ type: 'success', open: true });
              emit('refresh', proxyDate.value);
            });
        } else {
          emit('update:date', proxyDate.value);
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
</style>
