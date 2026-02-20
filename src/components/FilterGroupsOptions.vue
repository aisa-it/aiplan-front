<template>
  <q-select
    dense
    label="Группировка"
    :model-value="group_by"
    class="base-selector full-w"
    popup-content-class="fit-select-popup selector-option__wrapper scrollable-content"
    :options="optionsGroup"
    map-options
    option-label="label"
    option-value="value"
    emit-value
    @update:model-value="(val) => emits('update:group_by', val)"
  >
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps" class="selector-option__wrapper">
        <q-item-section>
          <q-item-label>
            {{ opt.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
defineProps<{
  group_by: string;
  optionsGroup: { value: string; label: string }[];
}>();

const emits = defineEmits<{
  'update:group_by': [string];
}>();
</script>

<style lang="scss" scoped>
.selector-option {
  &__wrapper {
    min-height: 40px;
  }

  &-columns__wrapper {
    padding-left: 12px;
  }
}
</style>
