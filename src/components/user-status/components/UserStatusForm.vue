<template>
  <v-card min-width="350">
    <v-form ref="formRef">
      <v-card-title> Выбрать статус </v-card-title>

      <v-card-text class="d-flex flex-column ga-4">
        <v-select
          v-model="form.status"
          label="Статус"
          :items="statusOptions"
          :item-title="formatStatus"
          item-value="value"
        >
          <template #selection="{ item }">
            {{ formatStatus(item) }}
          </template>
        </v-select>

        <v-text-field
          v-if="form.status === 'custom'"
          v-model="form.customStatusText"
          label="Текст статуса"
          maxlength="50"
          :rules="customStatusRules"
        />

        <v-select
          v-if="form.status !== 'none'"
          v-model="form.selectEndDate"
          label="Сбросить статус через"
          :items="durationOptions"
          item-title="label"
          item-value="value"
          :rules="durationRules"
        />

        <template v-if="form.selectEndDate === 'custom'">
          <div class="grid grid-cols-2 gap-4">
            <v-text-field
              v-model="form.customDate"
              v-maska="'##.##.####'"
              label="Дата"
              placeholder="ДД.ММ.ГГГГ"
              :rules="customDateRules"
              append-inner-icon="mdi-calendar"
            />

            <v-text-field
              v-model="form.customTime"
              v-maska="'##:##'"
              label="Время"
              placeholder="--:--"
              :rules="customTimeRules"
              append-inner-icon="mdi-clock-outline"
            />
          </div>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-btn
          variant="outlined"
          block
          class="rounded-lg px-2 py-0 min-w-0 uppercase"
          @click="emit('reset')"
        >
          Отменить
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          block
          class="rounded-lg px-2 py-0 min-w-0 uppercase"
          @click="handleSave"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useValidationRules } from '../composables/useValidationRules';

import { STATUS_OPTIONS, DURATION_OPTIONS } from '../UserStatus.config';

import type { UserStatusFormModel } from '../UserStatus.config';

const form = defineModel<UserStatusFormModel>({
  required: true,
});

const emit = defineEmits<{
  save: [];
  reset: [];
}>();

const formatStatus = (item: (typeof STATUS_OPTIONS)[number]) =>
  item.emoji ? `${item.emoji} ${item.label}` : item.label;

const statusOptions = STATUS_OPTIONS;
const durationOptions = DURATION_OPTIONS;

const formRef = ref();

const { customStatusRules, durationRules, customDateRules, customTimeRules } =
  useValidationRules(form);

const handleSave = async () => {
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  emit('save');
};
</script>
