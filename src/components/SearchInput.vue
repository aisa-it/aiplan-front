<template>
  <q-input
    label="Поиск"
    dense
    class="base-input admin-search"
    v-model="internalValue"
  >
    <template v-slot:prepend>
      <SearchIcon />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { debounce } from 'quasar';

import SearchIcon from 'src/components/icons/SearchIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | undefined;
    debounceValue?: number | undefined;
  }>(),
  { debounceValue: 700 },
);

const emit = defineEmits(['update:modelValue']);

const internalValue = ref(props.modelValue);

watch(
  () => internalValue.value,
  debounce((newVal) => {
    emit('update:modelValue', newVal);
  }, props.debounceValue),
);

watch(
  () => props.modelValue,
  (newVal) => {
    internalValue.value = newVal;
  },
);
</script>
