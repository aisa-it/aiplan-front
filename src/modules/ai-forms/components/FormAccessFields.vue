<template>
  <div>
    <div class="q-mt-sm">Доступ к прохождению</div>
    <div :class="!$q.screen.lt.sm ? 'row no-wrap' : 'column'">
      <q-radio v-model="model" :val="false" label="Анонимный пользователь" />
      <q-radio
        v-model="model"
        :val="true"
        label="Авторизованный пользователь"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const props = defineProps<{
  modelValue: boolean;
}>();

const emits = defineEmits<{
  'update:modelValue': [boolean];
}>();

const model = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emits('update:modelValue', val),
});
</script>
