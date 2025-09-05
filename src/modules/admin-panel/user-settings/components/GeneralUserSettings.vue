<template>
  <OnboardingWarning v-if="!userInfo.is_onboarded" />

  <FormSection :title="'Полное имя'">
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-md">
        <q-input
          v-model="userInfo.first_name"
          ref="firstName"
          dense
          class="base-input"
          label="Имя"
          :rules="[
            (val) => isEmpty(val, 'имя'),
            (val) => notDefisOnly(val, 'Имя'),
            (val) => maxLength(val, 100),
            (val) => latinAndCyrillic(val, 'Имя пользователя'),
          ]"
        />
      </div>
      <div class="col-12 col-md">
        <q-input
          v-model="userInfo.last_name"
          ref="lastName"
          dense
          class="base-input"
          label="Фамилия"
          :rules="[
            (val) => isEmpty(val, 'фамилию'),
            (val) => notDefisOnly(val, 'Фамилия'),
            (val) => maxLength(val, 100),
            (val) => latinAndCyrillic(val, 'Фамилия пользователя'),
          ]"
        />
      </div>
    </div>
  </FormSection>

  <FormSection :title="'Email'">
    <q-input
      v-model="userInfo.email"
      ref="email"
      dense
      class="base-input"
      label="Почта"
      :rules="[(val) => isEmail(val)]"
    />
  </FormSection>

  <FormSection :title="'Telegram ID'">
    <q-input
      v-model.trim="userInfo.telegram_id"
      dense
      class="base-input"
      label="Telegram ID"
    />
  </FormSection>

  <FormSection :title="'Имя пользователя'">
    <q-input
      v-model="userInfo.username"
      ref="userName"
      dense
      class="base-input"
      label="Имя пользователя"
      :rules="[
        (val) => isEmpty(val, 'имя пользователя'),
        (val) => maxLength(val, 100),
        (val) => isUsername(val),
      ]"
    />
  </FormSection>

  <ActionButtons
    @block="isBlockDialogShow = true"
    @save="save"
    :isActive="isActive(userInfo)"
  />

  <BlockUserDialog
    v-model="isBlockDialogShow"
    :user="userInfo"
    @success="onSuccess"
  />

  <SaveUserDialog
    v-model="isSaveDialogShow"
    :userInfo="userInfo"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue';

import BlockUserDialog from '../../dialogs/BlockUserDialog.vue';
import SaveUserDialog from '../dialogs/SaveUserDialog.vue';

import OnboardingWarning from '../ui/OnboardingWarning.vue';
import FormSection from '../ui/FormSection.vue';
import ActionButtons from '../ui/ActionButtons.vue';

import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

import { useNotificationStore } from 'src/stores/notification-store';

import {
  isEmpty,
  maxLength,
  isUsername,
  notDefisOnly,
  latinAndCyrillic,
  isEmail,
} from 'src/utils/validation';

import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { isActive } from '../../utils/active';

const emit = defineEmits(['update:user']);
const props = defineProps<{ user: DtoUserLight }>();

const { setNotificationView } = useNotificationStore();
const userInfo = toRef(() => props.user);

const isBlockDialogShow = ref(false);
const isSaveDialogShow = ref(false);

const firstName = ref();
const lastName = ref();
const userName = ref();
const email = ref();

const onSuccess = async () => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_UPDATE_DATA,
  });
  emit('update:user');
};

const save = () => {
  firstName.value.validate();
  lastName.value.validate();
  userName.value.validate();
  email.value.validate();

  const hasValidationErrors =
    firstName.value.hasError ||
    lastName.value.hasError ||
    userName.value.hasError ||
    email.value.hasError;

  if (hasValidationErrors) return;

  isSaveDialogShow.value = true;
};
</script>
