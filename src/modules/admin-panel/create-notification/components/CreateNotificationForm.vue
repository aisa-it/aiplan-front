<template>
  <div class="admin-notification">
    <q-input dense v-model="form.title" class="base-input" label="Тема" />
    <q-input
      dense
      v-model="form.msg"
      label="Описание"
      class="base-textarea admin-notification__textarea"
      type="textarea"
      rows="4"
      maxlength="300"
      counter
    />
    <div class="admin-notification__section">
      <q-checkbox
        class="admin-notification__checkbox"
        dense
        label="Отправить всем"
        :model-value="isAllSelected"
        @update:model-value="toggleMembers"
      />
      <SelectMembers
        v-model:members="form.members"
        :is-disabled="isAllSelected"
      />
    </div>
    <div class="admin-notification__section admin-notification__section_date">
      <q-checkbox
        class="admin-notification__checkbox"
        dense
        label="Отправить сейчас"
        :model-value="isSendNow"
        @update:model-value="toggleDate"
      />
      <ErrorWrapper
        :is-error="isErrorDate"
        class="admin-notification__section_select"
        error-message="Время не может быть меньше текущего"
        :hide-bottom-space="Screen.width <= 768 && !isErrorDate"
      >
        <SelectNotificationDate
          style="height: 40px"
          v-model:date="form.send_at"
          :is-error="isErrorDate"
          :is-disabled="isSendNow"
          class="admin-notification__section_select"
          @clear-error="isErrorDate = false"
        />
      </ErrorWrapper>
    </div>
    <div class="admin-notification__btns">
      <ResetButton @click="resetForm" />
      <SendButton
        :disable="!isReadyToSend"
        @click="$emit('send', form, resetForm)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Screen } from 'quasar';

import SelectNotificationDate from 'src/components/dialogs/WorkspaceNotificationDialog/SelectNotificationDate.vue';
import ErrorWrapper from 'src/components/errors/ErrorWrapper.vue';
import SelectMembers from './SelectMembers.vue';

import ResetButton from '../ui/ResetButton.vue';
import SendButton from '../ui/SendButton.vue';

import { useCreateNotificationForm } from '../composables/useCreateNotificationForm';
import { AiplanRequestMessage } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const {
  form,
  isErrorDate,
  isAllSelected,
  isSendNow,
  toggleDate,
  isReadyToSend,
  toggleMembers,
  resetForm,
} = useCreateNotificationForm();

defineEmits<{ send: [form: AiplanRequestMessage, resetForm: () => void] }>();
</script>

<style scoped lang="scss">
.admin-notification {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px;
  width: 100%;
  max-width: 600px;
  @media (max-width: 1006px) {
    max-width: 100%;
  }
  &__section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 600px;
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      align-items: start;
      gap: 8px;
      max-width: 100%;
    }
    &_date {
      align-items: start;
    }
    &_select {
      width: 336px;
      @media (max-width: 768px) {
        width: 100%;
      }
    }
  }
  &__btns {
    display: flex;
    gap: 12px;
    padding: 0;
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      gap: 8px;
      justify-content: end;
      & .btn {
        width: 100%;
        margin: 0;
      }
    }
  }
  &__textarea {
    padding: 0;
    :deep(.q-field__bottom--animated) {
      transform: none;
      bottom: 4px;
      right: 4px;
      @supports (-moz-appearance: none) {
        right: 12px;
      }
    }
  }
  &__checkbox {
    padding: 9.5px 0;
    @media (max-width: 768px) {
      padding: 0;
    }
  }
}
</style>
