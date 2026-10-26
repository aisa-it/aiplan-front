<template>
  <v-card min-width="350">
    <v-form ref="formRef">
      <v-card-title> {{ t('userStatus.form.title') }} </v-card-title>

      <v-card-text class="d-flex flex-column ga-4">
        <v-select
          v-model="form.status"
          :label="t('common.fields.status')"
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
          :label="t('userStatus.form.customText')"
          maxlength="50"
          :rules="customStatusRules"
        />

        <v-select
          v-if="form.status !== 'none'"
          v-model="form.selectEndDate"
          :label="t('userStatus.form.resetAfter')"
          :items="durationOptions"
          item-value="value"
          :rules="durationRules"
        />

        <template v-if="form.selectEndDate === 'custom'">
          <div class="grid grid-cols-2 gap-4">
            <v-text-field
              v-model="form.customDate"
              v-maska="'##.##.####'"
              :label="t('common.fields.date')"
              :placeholder="t('userStatus.form.datePlaceholder')"
              :rules="customDateRules"
              append-inner-icon="mdi-calendar"
            />

            <v-text-field
              v-model="form.customTime"
              v-maska="'##:##'"
              :label="t('common.fields.time')"
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
          {{ t('common.actions.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          block
          class="rounded-lg px-2 py-0 min-w-0 uppercase"
          @click="handleSave"
        >
          {{ t('common.actions.save') }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();

const formatStatus = (item: (typeof STATUS_OPTIONS)[number]) =>
  item.emoji
    ? `${item.emoji} ${t(`userStatus.statuses.${item.value}`)}`
    : t(`userStatus.statuses.${item.value}`);

const statusOptions = STATUS_OPTIONS;
const durationOptions = computed(() =>
  DURATION_OPTIONS.map((option) => ({
    title: t(`userStatus.durations.${option.value}`),
    value: option.value,
  })),
);

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
