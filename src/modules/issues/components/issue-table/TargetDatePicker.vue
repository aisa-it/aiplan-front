<template>
  <v-locale-provider :locale="locale" :messages="{ en, ru }">
    <v-card class="flex! max-h-[85dvh] max-w-[calc(100vw-24px)] flex-col">
      <div
        class="flex min-h-0 flex-col items-center gap-4 overflow-y-auto px-2 py-2 min-[662px]:flex-row"
      >
        <v-date-picker
          v-model="date"
          :min="minDate"
          :max="maxDate"
          :first-day-of-week="1"
          width="300"
          class="max-w-full shrink-0"
          hide-header
        />
        <v-time-picker
          v-model="time"
          format="24hr"
          :min="minTime"
          width="300"
          class="max-w-full shrink-0"
          hide-title
        />
      </div>
      <v-card-actions class="shrink-0 gap-2">
        <v-btn
          variant="outlined"
          :disabled="isSaving"
          class="flex-1 normal-case"
          @click="emit('save', null)"
        >
          {{ t('issues.targetDate.clear') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!isValid"
          :loading="isSaving"
          class="flex-1 normal-case"
          @click="save"
        >
          {{ t('issues.targetDate.set') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-locale-provider>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { en, ru } from 'vuetify/locale';
import { useIssueTargetDate } from '../../composables/useIssueTargetDate';

const { t, locale } = useI18n();

const props = defineProps<{ initialDate?: string | null; isSaving: boolean }>();
const emit = defineEmits<{ save: [value: string | null] }>();
const { date, time, minDate, maxDate, minTime, isValid, getValue } =
  useIssueTargetDate(props.initialDate);

const save = () => {
  const value = getValue();
  if (value) emit('save', value);
};
</script>
