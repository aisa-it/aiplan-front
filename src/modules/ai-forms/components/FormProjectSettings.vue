<template>
  <div class="row gap-x-4">
    <q-checkbox
      v-model="localIsAutoCreate"
      label="Автоматическое создание задачи на ответ"
    />

    <q-select
      v-model="localForm.target_project_id"
      :disable="!localIsAutoCreate"
      :options="projects"
      dense
      class="base-selector"
      popup-content-class="scrollable-content fit-popup"
      option-value="id"
      option-label="name"
      label="Проект"
      style="min-width: 200px"
      emit-value
      map-options
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type {
  AiplanReqForm,
  DtoProject,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  modelValue: AiplanReqForm;
  isAutoCreateProject: boolean;
  projects: Array<DtoProject>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: AiplanReqForm): void;
  (e: 'update:isAutoCreateProject', value: boolean): void;
}>();

const localForm = ref<AiplanReqForm>({ ...props.modelValue });
const localIsAutoCreate = ref(props.isAutoCreateProject);

watch(localForm, (val) => emit('update:modelValue', val), { deep: true });

watch(localIsAutoCreate, (val) => emit('update:isAutoCreateProject', val));

watch(
  () => props.modelValue,
  (val) => {
    if (val !== localForm.value) localForm.value = { ...val };
  },
  { deep: true },
);

watch(
  () => props.isAutoCreateProject,
  (val) => {
    if (val !== localIsAutoCreate.value) localIsAutoCreate.value = val;
  },
);
</script>
