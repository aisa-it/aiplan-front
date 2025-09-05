<template>
  <div class="centered-horisontally import-setting">
    <span v-if="showLabel" class="setting-item">{{ priorityLabel }}</span>
    <q-select
      :model-value="priority"
      dense
      :label="showLabel ? 'Приоритет' : priorityLabel"
      options-dense
      clearable
      class="base-selector setting-item"
      behavior="menu"
      :rules="[(val) => val || 'Выберите приоритет']"
      :options="priorityOptions"
      @update:model-value="updateModelValue"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <div class="row centered-horisontally">
              <q-avatar size="24px" class="q-mr-sm">
                <q-img :src="scope.opt.iconUrl" class="img-cover" />
              </q-avatar>
              {{ scope.opt.name }}
            </div>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:selected>
        <q-avatar size="16px" class="q-mr-sm">
          <q-img :src="priority?.iconUrl" class="img-cover" />
        </q-avatar>
        <span class="centered-horisontally">
          {{ priority?.name }}
        </span>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
// core
import { toRefs } from 'vue';
// interfaces
import { JiraPriority } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// props
const props = withDefaults(
  defineProps<{
    showLabel?: boolean;
    priorityLabel: string;
    priority: JiraPriority | null;
    priorityOptions?: Array<JiraPriority>;
  }>(),
  {
    showLabel: true,
    priorityLabel: '',
    priorityOptions: () => [],
  },
);

// emits
const emits = defineEmits<{
  'update:priority': [value: JiraPriority | null];
}>();

const { priority, priorityOptions, priorityLabel, showLabel } = toRefs(props);

const updateModelValue = (val: JiraPriority | null) => {
  emits('update:priority', val);
};
</script>

<style scoped lang="scss">
.import-setting {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
}

@media screen and (max-width: 480px) {
  .import-setting {
    flex-direction: column;
    align-items: start;
  }
}
.setting-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
