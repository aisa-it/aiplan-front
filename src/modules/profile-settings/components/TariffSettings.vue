<template>
  <section class="tariff q-mb-md">
    <div class="tariff__header-wrapper">
      <div class="tariff__header-text">
        <h4 class="tariff__heading text-lg font-semibold text-brand-base">
          Название текущего тарифа
        </h4>
        <span class="tariff__expiration-date">До 31.12.26</span>
      </div>
      <q-btn
        class="primary-btn-sm tariff__upgrage-btn"
        flat
        dense
        no-caps
      >
        Прокачать команду
      </q-btn>
    </div>

    <div class="tariff__specs">
      <div v-for="(value, spec, idx) of info" :key="idx" class="tariff__card">
        <p class="tariff__parameter body-1">{{ spec }}</p>
        <p v-if="value === false" class="tariff__parameter-value">
          <CloseRoundedIcon /> Нет
        </p>
        <p v-else-if="value === true" class="tariff__parameter-value">
          <CheckRoundedIcon /> Да
        </p>
        <p v-else class="tariff__parameter-value">{{ value }}</p>
      </div>
    </div>
  </section>

  <q-table
    title="Информация о пространствах"
    :rows="tariffUsageData"
    :columns="tariffUsageColumns"
    class="tariff-table q-mb-md"
    flat
    row-key="name"
    hide-bottom
  >
    <template v-slot:top-right>
      <q-select
        borderless
        v-model="showUsedWorkspacesInTable"
        :options="workspacesUsedRows"
        emit-value
        map-options
        class="tariff-table__select body-1"
      />
    </template>

    <template v-slot:body-cell-projects="props">
      <q-td :props="props">
        <ProgressBar
          :current-value="props.value.currentValue"
          :max-value="props.value.maxValue"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-users="props">
      <q-td :props="props">
        <ProgressBar
          :current-value="props.value.currentValue"
          :max-value="props.value.maxValue"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-attachments="props">
      <q-td :props="props">
        <ProgressBar
          :current-value="props.value.currentValue"
          :max-value="props.value.maxValue"
          :units="'Гб'"
        />
      </q-td>
    </template>
  </q-table>

  <q-table
    title="История покупок"
    :rows="tariffPurchasesData"
    :columns="tariffPurchasesColumns"
    class="tariff-table q-mb-md"
    flat
    row-key="name"
    hide-bottom
  >
    <template v-slot:top-right>
      <q-select
        borderless
        v-model="showPurchasesInTable"
        :options="purchasesRows"
        emit-value
        map-options
        class="tariff-table__select"
      />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useWorkspaceStore } from 'src/stores/workspace-store';

import ProgressBar from 'src/shared/components/ProgressBar.vue';
import CloseRoundedIcon from 'src/components/icons/CloseRoundedIcon.vue';
import CheckRoundedIcon from 'src/components/icons/CheckRoundedIcon.vue';

const route = useRoute();
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const { getTariffInfo } = useWorkspaceStore();
const tariffData = ref();

const showUsedWorkspacesInTable = ref(10);
const showPurchasesInTable = ref(10);

const workspacesUsedRows = [
  { label: 'Показывать 5 пространств', value: 5 },
  { label: 'Показывать 10 пространств', value: 10 },
  { label: 'Показывать 20 пространств', value: 20 },
  { label: 'Показывать все пространства', value: 0 },
];

const purchasesRows = [
  { label: 'Показывать 5 покупок', value: 5 },
  { label: 'Показывать 10 покупок', value: 10 },
  { label: 'Показывать 20 покупок', value: 20 },
  { label: 'Показывать все покупки', value: 0 },
];

// TODO Мокап убрать
const info = {
  Пространства: 10,
  'Проектов в одном пространстве': 10,
  'Пользователей в одном пространстве': 15,
  'Вложений в одном пространстве': '50 Гб',
  АИДок: true,
  'Импорт из Jira': false,
};

const tariffUsageColumns = [
  { name: 'name', label: 'Название', field: 'name', align: 'left' },
  {
    name: 'projects',
    label: 'Проектов',
    field: 'projects',
    align: 'left',
  },
  {
    name: 'users',
    label: 'Пользователей',
    field: 'users',
    align: 'left',
  },
  {
    name: 'attachments',
    label: 'Вложения',
    field: 'attachments',
    align: 'left',
  },
];

const tariffPurchasesColumns = [
  { name: 'name', label: 'Элемент', field: 'name', align: 'left' },
  { name: 'date', label: 'Дата и время', field: 'date', align: 'left' },
  { name: 'payment', label: 'Сумма', field: 'payment', align: 'left' },
  {
    name: 'payment_option',
    label: 'Способ оплаты',
    field: 'payment_option',
    align: 'left',
  },
];

// TODO Заменить моки на реальные данные
const tariffUsageData = [
  {
    name: 'Тариф A',
    projects: { currentValue: 3, maxValue: 5 },
    users: { currentValue: 800, maxValue: 1200 },
    attachments: { currentValue: 25, maxValue: 25 },
  },
];

const tariffPurchasesData = [
  {
    name: 'Покупка тарифа',
    date: '31.12.25',
    payment: 1500,
    payment_option: 'Банковская карта',
  },
  {
    name: 'Покупка тарифа',
    date: '31.12.24',
    payment: 1500,
    payment_option: 'СБП',
  },
];

// TODO показывает получаемые данные, потом убрать
onMounted(async () => {
  await getTariffInfo(
    currentWorkspaceSlug.value
      ? currentWorkspaceSlug.value
      : (route.params.workspace as string),
  ).then((data) => (tariffData.value = data));
});
</script>

<style scoped lang="scss">
.tariff {
  &__header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__header-text {
    display: flex;
    flex-direction: column;
  }

  &__heading {
    font-weight: 500;
    font-size: 24px;
    line-height: 100%;
    letter-spacing: 0;
    color: var(--dark);
  }

  &__expiration-date {
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.5px;
  }

  &__upgrage-btn {
    padding: 11px 16px !important;
    font-size: 16px;
  }

  &__specs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  &__card {
    padding: 16px;
    border: 1px solid var(--dark-border-color);
    border-radius: 16px;
  }

  &__parameter {
    word-break: keep-all;
  }

  &__parameter-value {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 24px;
    margin: 0;
    font-weight: 500;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: 0.15px;
  }
}

.tariff-table {
  &:deep(.q-field__native) {
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.5px;
    color: var(--text-color);
  }

  &:deep(.q-table) {
    border: 1px solid var(--dark-border-color);
    border-radius: 16px;
    overflow: hidden;
  }

  &:deep(.q-table__top) {
    padding: 16px 0;
  }

  &:deep(th) {
    font-weight: 500;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: 0.15px;
  }

  &:deep(td) {
    font-weight: 400;
    font-size: 16px !important;
    line-height: 22px;
    letter-spacing: 0.5px;
  }
}

@media screen and (width < 600px) {
  .tariff {
    &__specs {
      display: flex;
      flex-direction: column;
    }
  }

  .tariff-table {
    &:deep(th) {
      font-size: 16px;
    }

    &:deep(td) {
      font-size: 14px !important;
    }
  }
}
</style>
