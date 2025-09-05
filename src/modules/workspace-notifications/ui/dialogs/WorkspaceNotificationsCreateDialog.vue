<template>
  <q-dialog ref="dialogRef" persistent @before-show="reset">
    <q-card class="notification-card" :style="'position: relative'">
      <div
        class="row items-center justify-between centered-horisontally q-mb-xs"
      >
        <h6 style="font-weight: 600; margin: 0 !important">
          Создать уведомление
        </h6>

        <q-btn flat dense v-close-popup><CloseIcon /></q-btn>
      </div>

      <q-input dense v-model="form.title" class="base-input" label="Тема" />
      <q-input
        dense
        v-model="form.msg"
        label="Описание"
        class="base-textarea notification-card__textarea"
        type="textarea"
        rows="3"
        maxlength="100"
        counter
      />
      <div class="notification-card__form-section">
        <q-checkbox
          class="notification-card__checkbox"
          dense
          label="Отправить всем"
          :model-value="isAllSelected"
          @update:model-value="toggleMembers"
        />
        <SelectNotificationRecipients
          v-model:recipients="form.members"
          :is-disabled="isAllSelected"
          :options="workspaceUsers"
          :current-member="user"
          :is-role-ignored="false"
          class="notification-card__form-section_select"
        />
      </div>
      <div
        class="notification-card__form-section notification-card__form-section_date"
      >
        <q-checkbox
          class="notification-card__checkbox"
          dense
          label="Отправить сейчас"
          :model-value="isSendNow"
          @update:model-value="toggleDate"
        />
        <ErrorWrapper
          :is-error="isErrorDate"
          class="notification-card__form-section_select"
          error-message="Время не может быть меньше текущего"
          :hide-bottom-space="Screen.width <= 768 && !isErrorDate"
        >
          <SelectNotificationDate
            ref="selectDate"
            style="height: 40px"
            v-model:date="form.send_at"
            :is-error="isErrorDate"
            :is-disabled="isSendNow"
            class="notification-card__form-section_select"
            @clear-error="isErrorDate = false"
          />
        </ErrorWrapper>
      </div>
      <q-card-actions class="notification-card__btn-section">
        <q-btn
          flat
          dense
          no-caps
          class="secondary-btn"
          label="Отменить"
          @click="handleClose"
        />
        <q-btn
          flat
          dense
          no-caps
          class="primary-btn"
          label="Отправить"
          :disable="!isReadyToSend"
          @click="handleSend"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Screen, useDialogPluginComponent } from 'quasar';
import { useRoute } from 'vue-router';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useUserStore } from 'src/stores/user-store';

// services
import { sendWorkspaceNotification } from '../../services/api';

// components
import SelectNotificationDate from 'src/components/dialogs/WorkspaceNotificationDialog/SelectNotificationDate.vue';
import SelectNotificationRecipients from 'src/components/dialogs/WorkspaceNotificationDialog/SelectNotificationRecipients.vue';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import ErrorWrapper from 'src/components/errors/ErrorWrapper.vue';
import { AiplanRequestMessage } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// plugins
const { dialogRef, onDialogCancel } = useDialogPluginComponent();

// stores
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();

// store to ref
const { workspaceUsers } = storeToRefs(workspaceStore);
const { user } = storeToRefs(userStore);

const route = useRoute();

// vars
const isAllSelected = ref(false);
const isSendNow = ref(false);
const selectDate = ref();
const isErrorDate = ref(false);

const form = reactive<AiplanRequestMessage>({
  title: '',
  msg: '',
  send_at: undefined,
  members: [],
});

const isReadyToSend = computed(() => {
  const hasNameAndDescription = form.title && form.msg;
  const hasRecipients = form.members?.length;
  const hasDate = !!form.send_at;

  return (
    (hasNameAndDescription && isAllSelected.value && isSendNow.value) ||
    (hasNameAndDescription && hasRecipients && isSendNow.value) ||
    (hasNameAndDescription && hasDate && isAllSelected.value) ||
    (hasNameAndDescription && hasDate && hasRecipients)
  );
});

const toggleMembers = (value: boolean) => {
  if (value) form.members = [];
  isAllSelected.value = value;
};

const toggleDate = (value: boolean) => {
  if (value) {
    form.send_at = undefined;
    isErrorDate.value = false;
  }
  isSendNow.value = value;
};

const handleClose = () => {
  onDialogCancel();
};

const handleSend = async () => {
  if (!isSendNow.value) isErrorDate.value = !selectDate.value.isValidTime();
  if (isErrorDate.value) return;
  const slug = route.params.workspace as string;
  await sendWorkspaceNotification(slug, form);
  onDialogCancel();
};

const reset = () => {
  form.title = '';
  form.msg = '';
  form.send_at = undefined;
  form.members = [];
  isAllSelected.value = false;
  isSendNow.value = false;
  isErrorDate.value = false;
};
</script>

<style lang="scss" scoped>
.notification-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
  width: 576px;
  border-radius: 16px;
  @media (max-width: 768px) {
    min-width: 80% !important;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  &__form-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      align-items: start;
      gap: 8px;
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
  &__btn-section {
    display: flex;
    justify-content: right;
    padding: 0;
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      gap: 8px;
      justify-content: end;
      margin-top: 72px;
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
      padding: 0 15px;
    }
  }
}
</style>
