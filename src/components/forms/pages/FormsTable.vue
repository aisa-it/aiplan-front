<template>
  <div class="q-pa-none fit full-height relative">
    <q-card flat>
      <q-card-section
        class="row issue-list__header"
        :style="'padding: 12px 16px'"
      >
        <div
          class="q-table__title abbriviated-text"
          :style="' max-width: calc(100% - 60px)'"
        >
          Ответы на форму "{{ form?.title }}"
        </div>
      </q-card-section>
      <q-table
        flat
        v-model:pagination="pagination"
        :rows="rows"
        :columns="columns"
        row-key="name"
        loading-label="Загружается..."
        :rows-per-page-options="[10, 25, 50, 100]"
        @row-click="(e, row) => openAnswers(row)"
        @request="refresh"
      >
        <template v-slot:body-cell-question="props">
          <q-td :props="props">
            <div v-html="props.value"></div>
          </q-td>
        </template>
        <template v-slot:body-cell-answer="props">
          <q-td :props="props">
            <div v-html="props.value"></div>
          </q-td>
        </template>
        <template v-slot:body-cell-responder="props">
          <q-td :props="props">
            <div v-if="props.row.responder" class="flex items-center gap-x-4">
              <AvatarImage
                :key="props.row.responder?.id"
                :tooltip="aiplan.UserName(props.row?.responder).join(' ')"
                :text="
                  [
                    aiplan.UserName(props.row?.responder)[0]?.at(0),
                    aiplan.UserName(props.row?.responder)[1]?.at(0),
                  ].join(' ')
                "
                :image="props.row.responder?.avatar_id"
                :member="props.row?.responder"
                :show-avatar-popup="true"
                is-show-popup-middle
                @click.stop
              ></AvatarImage>
              <span>{{ props.row?.responder?.username }}</span>
            </div>

            <span v-else> Анонимный </span>
          </q-td>
        </template>
        <template #pagination>
          <PaginationDefault
            v-model:selected-page="pagination.page"
            :rows-number="pagination.rowsNumber"
            :rows-per-page="pagination.rowsPerPage"
            @update:selectedPage="refresh({ pagination: pagination })"
          />
        </template>
        <template v-slot:no-data>
          <div
            class="column flex-center"
            style="width: 100%; height: calc(80vh)"
          >
            <DefaultLoader v-if="loading" />

            <div v-if="!loading && !rows.length" class="column flex-center">
              <DocumentIcon :width="56" :height="56" />
              <h6>Нет данных</h6>
            </div>
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
  <FormAnswers
    v-model="isFormAnswersOpen"
    :answerId="answerId"
    :formSlug="String(route.params.formSlug)"
  />
</template>

<script lang="ts" setup>
//core
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { QTableColumn, useMeta } from 'quasar';

//utils
import aiplan from 'src/utils/aiplan';
import { parseText } from 'src/utils/helpers';
import { formatDateTime } from 'src/utils/time';

//api
import { getAnswers, getFormAuth } from 'src/components/forms/services/api';

//components
import AvatarImage from 'src/components/AvatarImage.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import FormAnswers from 'src/components/forms/dialogs/FormAnswers.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';

//composables
const route = useRoute();

//state
const rows = ref([]);
const answerId = ref();
const isFormAnswersOpen = ref(false);
const form = ref();
const loading = ref(false);

const metadata = ref({
  title: 'Форма',
});

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

//methods
const openAnswers = (answer) => {
  answerId.value = answer.seq_id;
  isFormAnswersOpen.value = true;
};

const refresh = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  const offset = (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage);
  const limit = rowsPerPage == 0 ? 10 : rowsPerPage;

  loading.value = true;

  const data = await getAnswers(
    route.params.workspace as string,
    route.params.formSlug as string,
    {
      offset: offset,
      limit: limit,
    },
  ).finally(() => (loading.value = false));
  pagination.value.rowsNumber = data.count;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.rowsPerPage = data.limit;
  pagination.value.page = page;
  rows.value = data.result;
  metadata.value.title = `Форма ${form.value.title}`;
};

const getCurrentForm = async () => {
  if (!route.params.formSlug) return;
  const data = await getFormAuth(String(route.params.formSlug));
  form.value = data;
};

const answerRender = (type: string, value: string | boolean) => {
  if (type === 'checkbox') {
    return value ? 'Да' : 'Нет';
  }
  console.log(form.value);
  if (type === 'attachment') {
    const found = form.value.attachments.find((a) => a.id === value);
    if (found?.asset?.name) return found.asset.name;
  }
  return parseText(value?.toString()) ?? 'Нет ответа';
};

const pluralAnswers = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return count + ' ответ';
  } else if (
    [2, 3, 4].includes(count % 10) &&
    ![12, 13, 14].includes(count % 100)
  ) {
    return count + ' ответа';
  } else {
    return count + ' ответов';
  }
};

const pluralQuestions = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return count + ' вопрос';
  } else if (
    [2, 3, 4].includes(count % 10) &&
    ![12, 13, 14].includes(count % 100)
  ) {
    return count + ' вопроса';
  } else {
    return count + ' вопросов';
  }
};

//lifecycle hooks
useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

onMounted(async () => {
  await getCurrentForm();
  await refresh({ pagination: pagination.value });
});

const columns: QTableColumn[] = [
  {
    headerStyle: 'width: 64px;',
    name: 'seq_id',
    align: 'left',
    label: '№',
    field: (row: any) => {
      return `${row?.seq_id}`;
    },
    // sortable: true,
  },
  {
    headerStyle: 'width: 250px;',
    name: 'responder',
    align: 'left',
    label: 'Пользователь',
    field: (row: any) => {
      return `${row?.responder}`;
    },
    // sortable: true,
  },
  {
    headerStyle: 'width: 600px;',
    name: 'question',
    align: 'left',
    label: 'Вопрос',
    field: (row: any) => row?.fields,
    format: (fields) => {
      if (!fields) return '';

      const endTag = `<p class="q-ma-none file-date">и еще ${pluralQuestions(
        fields.length - 2,
      )}</p>`;

      const parsedFields = fields
        .slice(0, 2)
        .map(
          (el, index) =>
            `<p class="q-ma-none abbriviated-text"> Вопрос ${index + 1}: ${
              el.label
            } </p>`,
        )
        .join('');

      return fields.length > 2 ? parsedFields + endTag : parsedFields;
    },
    // sortable: true,
  },
  {
    headerStyle: 'width: 600px;',
    name: 'answer',
    align: 'left',
    label: 'Ответ',
    field: (row: any) => row?.fields,
    format: (fields) => {
      if (!fields) return '';

      const endTag = `<p class="q-ma-none file-date">и еще ${pluralAnswers(
        fields.length - 2,
      )}</p>`;

      const parsedFields = fields
        .slice(0, 2)
        .map(
          (el, index) =>
            `<p class="q-ma-none abbriviated-text"> Ответ ${
              index + 1
            }: ${answerRender(el.type, el.values)} </p> `,
        )
        .join('');
      return fields.length > 2 ? parsedFields + endTag : parsedFields;
    },
    // sortable: true,
  },
  {
    headerStyle: 'width: 140px;',
    name: 'created_at',
    align: 'left',
    label: 'Дата ответа',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    // sortable: true,
  },
];
</script>
<style scoped lang="scss">
:deep(.q-table) {
  table-layout: fixed;
}
</style>
