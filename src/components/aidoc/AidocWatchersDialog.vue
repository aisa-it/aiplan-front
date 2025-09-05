<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @before-show="setWatchers"
    @update:modelValue="updateModelValue"
  >
    <q-card class="dialog-card">
      <q-card-section class="row items-center">
        <div class="text-h6 text-weight-bold">Наблюдатели</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="col flex rounded-borders">
          <SelectWatchers
            v-model:watchers="docWatchers"
            class="watchers-selector"
            :docId="docId"
            :current-member="user"
            :isDisabled="!canEdit"
            :is-loading="loading"
            @refresh="emit('refresh')"
          ></SelectWatchers>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { storeToRefs } from 'pinia';
import SelectWatchers from '../selects/SelectWatchers.vue';
import { useUserStore } from 'src/stores/user-store';

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
  canEdit?: boolean;
  docId?: string;
  watchers?: any;
}>();

const emit = defineEmits(['refresh', 'update:modelValue']);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const docWatchers = ref([]);

const setWatchers = () => {
  docWatchers.value = props.watchers?.map((user) => ({
    member: { ...user },
  }));
};

const updateModelValue = (value: boolean) => emit('update:modelValue', value);
</script>

<style scoped>
.dialog-card {
  min-width: 600px;
}

@media screen and (max-width: 650px) {
  .dialog-card {
    min-width: unset;
  }
}
</style>
