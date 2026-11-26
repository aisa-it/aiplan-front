<template>
  <v-dialog
    :model-value="form !== null"
    :persistent="deleting"
    max-width="570"
    aria-labelledby="delete-form-title"
    aria-describedby="delete-form-description"
    @update:model-value="(open) => !open && (form = null)"
  >
    <v-card class="delete-form-card border border-solid border-border">
      <div class="px-4 pt-4 text-sm">
        <h2 id="delete-form-title" class="mb-4 text-lg leading-6 font-semibold">
          {{ t('forms.deleteDialog.title') }}
        </h2>
        <div id="delete-form-description" class="wrap-break-word">
          <i18n-t keypath="forms.deleteDialog.confirm" tag="p" scope="global">
            <template #title><strong>{{ form?.title }}</strong></template>
          </i18n-t>
          <p>{{ t('forms.deleteDialog.warning') }}</p>
        </div>
      </div>

      <div class="flex flex-wrap justify-end gap-2 px-2 pt-6 pb-2">
        <v-btn
          color="primary"
          variant="outlined"
          width="100"
          height="40"
          :disabled="deleting"
          @click="form = null"
        >
          {{ t('common.actions.cancel') }}
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          width="100"
          height="40"
          class="text-white"
          :loading="deleting"
          @click="emit('confirm')"
        >
          {{ t('common.actions.delete') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useI18n } from 'vue-i18n';

defineProps<{ deleting: boolean }>();

const form = defineModel<DtoFormLight | null>({ required: true });
const emit = defineEmits<{ confirm: [] }>();
const { t } = useI18n();
</script>

<style scoped>
.delete-form-card {
  border-radius: 16px;
}
</style>
