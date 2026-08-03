<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card class="rounded-2xl bg-white" color="white" elevation="0">
      <v-card-title class="text-h5 font-weight-regular"
        >Восстановление пароля</v-card-title
      >

      <v-card-text class="d-flex flex-column">
        <v-text-field
          v-model="email"
          label="Введите Email"
          density="comfortable"
          color="primary"
          :rules="[
            (v) => !!v || 'Введите email',
            (v) => isEmail(v) || 'Некорректный email',
          ]"
        ></v-text-field>

        <CaptchaWidget
          v-if="isEnabledCaptcha"
          :key="updateKey"
          @verified="(payload) => (captchaPayload = payload)"
        />

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="text-body-2"
        >
          {{ successMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          variant="outlined"
          @click="closeDialog"
          class="text-none font-weight-medium"
        >
          Назад
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          @click="restore"
          :loading="loading"
          :disabled="isEnabledCaptcha ? !captchaPayload : false"
          class="text-none"
        >
          Восстановить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AuthService } from '../api/auth.service';
import { useUtilsStore } from '@/stores/utils-store';
import { storeToRefs } from 'pinia';
import CaptchaWidget from './CaptchaWidget.vue';
import { isEmail } from '@/utils/validation';
import { SUCCESS_RESTORE_PASS } from '../constants';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const loading = ref(false);
const utilsStore = useUtilsStore();
const { isEnabledCaptcha } = storeToRefs(utilsStore);

const email = ref('');
const captchaPayload = ref('');
const successMessage = ref('');
const updateKey = ref(0);

const closeDialog = () => {
  isOpen.value = false;

  setTimeout(() => {
    email.value = '';
    captchaPayload.value = '';
    successMessage.value = '';
    updateKey.value++;
  }, 300);
};

const restore = async () => {
  if (!email.value || !isEmail(email.value)) return;

  loading.value = true;
  const success = await AuthService.forgotPassword(
    email.value,
    captchaPayload.value,
  );
  loading.value = false;

  if (success) {
    successMessage.value = SUCCESS_RESTORE_PASS;
    setTimeout(() => {
      closeDialog();
    }, 3000);
  }
};
</script>
