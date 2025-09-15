<template>
  <div v-if="importStore.importJiraInfo">
    <q-form
      class="jira-project-wrapper"
      @submit="handleStartImport()"
      @reset="getBack()"
    >
      <h6>Блокирующая связь</h6>
      <q-select
        v-model="block"
        dense
        label="Блок. связь"
        options-dense
        clearable
        class="base-selector"
        behavior="menu"
        :rules="[(val) => val || 'Выберите блок. связь']"
        :options="importStore.importJiraInfo.link_types"
        :option-label="(v) => v.name"
        :option-value="(v) => v.id"
      >
      </q-select>

      <h6>Одноуровневая связь задач</h6>
      <q-select
        v-model="relates"
        dense
        label="Связь задач"
        options-dense
        clearable
        class="base-selector"
        multiple
        behavior="menu"
        :rules="[(val) => val || 'Выберите тип связи задач']"
        :options="importStore.importJiraInfo.link_types"
        :option-label="(v) => v.name"
        :option-value="(v) => v.id"
      >
      </q-select>

      <h6>Приоритеты</h6>
      <SelectPriority
        v-model:priority="priorities.urgent_id"
        :show-label="showFullText"
        priority-label="Критический"
        :priority-options="importStore.importJiraInfo.priorities"
      />

      <SelectPriority
        v-model:priority="priorities.high_id"
        :show-label="showFullText"
        priority-label="Высокий"
        :priority-options="importStore.importJiraInfo.priorities"
      />

      <SelectPriority
        v-model:priority="priorities.medium_id"
        :show-label="showFullText"
        priority-label="Средний"
        :priority-options="importStore.importJiraInfo.priorities"
      />

      <SelectPriority
        v-model:priority="priorities.low_id"
        :show-label="showFullText"
        priority-label="Низкий"
        :priority-options="importStore.importJiraInfo.priorities"
      />

      <SelectPriority
        v-model:priority="priorities.null_id"
        :show-label="showFullText"
        priority-label="Не выбран"
        :priority-options="importStore.importJiraInfo.priorities"
      />

      <div class="row justify-between">
        <q-btn no-caps class="secondary-btn" type="reset"> Назад </q-btn>
        <q-btn no-caps class="primary-btn" type="submit">
          {{ textBtnSubmit }}
        </q-btn>
      </div>
    </q-form>
    <q-inner-loading :showing="loading">
      <DefaultLoader />
    </q-inner-loading>
  </div>
</template>

<script lang="ts" setup>
// core
import { Screen } from 'quasar';
import { computed, ref } from 'vue';
//store
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
// components
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import SelectPriority from './select-priority/SelectPriority.vue';
//types
import {
  AiplanJiraInfoRequest,
  EntityPrioritiesMapping,
  JiraPriority,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// emits
const emits = defineEmits(['next', 'get-back']);

//stores
const importStore = useImportStore();

//state
const block = ref();
const relates = ref();
const loading = ref(false);
const priorities = ref({
  urgent_id: null as JiraPriority | null,
  high_id: null as JiraPriority | null,
  medium_id: null as JiraPriority | null,
  low_id: null as JiraPriority | null,
  null_id: null as JiraPriority | null,
});

//computed
const showFullText = computed(() => Screen.width > 480);

const textBtnSubmit = computed(() => {
  return showFullText.value ? 'Начать импорт' : 'Начать';
});

//methods
const handleStartImport = async () => {
  loading.value = true;
  let filteredPriorities = {} as EntityPrioritiesMapping;

  for (let p in priorities.value) {
    const keyPriorities = p as keyof EntityPrioritiesMapping;

    if (priorities.value[keyPriorities]?.id) {
      filteredPriorities[keyPriorities] = priorities.value[keyPriorities].id;
    }
  }

  await importStore
    .startImport(
      importStore.jiraProject.key,
      Object.assign({}, importStore.userInfo, {
        target_workspace_id: importStore.userWs.id as string,
        block_link_id: block.value.id,
        relates_link_id: relates.value.map(
          (relate: { id: string }) => relate.id,
        ),
        priorities_mapping: filteredPriorities,
      }) as AiplanJiraInfoRequest,
    )
    .then(() => {
      emits('next');
    })

    .finally(() => {
      loading.value = false;
    });
  return;
};

const getBack = () => emits('get-back');
</script>

<style scoped lang="scss">
.jira-project-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
