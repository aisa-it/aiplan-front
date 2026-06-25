<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="modal-card q-pb-md">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Восстановление пароля</h6>
        <q-input
          dense
          label="Введите Email"
          v-model="email"
          class="base-input q-mb-sm"
        />
        <CaptchaWidget
          v-if="isEnabledCaptcha"
          @verified="(payload) => (captchaPayload = payload)"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn unelevated class="secondary-btn" no-caps @click="onDialogCancel">
          Назад
        </q-btn>
        <q-btn
          unelevated
          class="primary-btn"
          no-caps
          :disable="isEnabledCaptcha ? captchaPayload == '' : false"
          @click="restore"
        >
          Восстановить
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useDialogPluginComponent } from 'quasar';
import CaptchaWidget from './CaptchaWidget.vue';
import { SUCCESS_RESTORE_PASS } from 'src/constants/notifications';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';

defineEmits(useDialogPluginComponent.emits);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const { setNotificationView } = useNotificationStore();
const api = useAiplanStore();
const email = ref('');
const captchaPayload = ref('');

const restore = () => {
  api
    .forgotPassword(email.value, captchaPayload.value)
    .then(() =>
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_RESTORE_PASS,
      }),
    )

    .finally(() => onDialogOK());
};

const { isEnabledCaptcha } = storeToRefs(useUtilsStore());
</script>
