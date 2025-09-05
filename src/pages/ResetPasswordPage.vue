<template>
  <q-page class="fully-centered">
    <h6>Введите новый пароль</h6>
    <q-input
      :type="isFirstPassword ? 'password' : 'text'"
      dense
      v-model="password.new_password"
      class="base-input q-mb-xs"
      label="Введите пароль"
      lazy-rules
      :style="'width: 300px'"
      :rules="[
        (val) => (val && val.length > 0) || 'Пожалуйста, введите пароль',
      ]"
    >
      <template v-slot:append>
        <q-icon
          :name="isFirstPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isFirstPassword = !isFirstPassword"
        /> </template
    ></q-input>
    <q-input
      dense
      class="base-input q-mb-xs"
      :type="isSecondPassword ? 'password' : 'text'"
      v-model="password.confirm_password"
      label="Подтвердите пароль"
      lazy-rules
      :style="'width: 300px'"
      :rules="[
        (val: string) =>
          (val && val.length > 0) || 'Пожалуйста, введите пароль еще раз',
        (val: string) => val === password.new_password || 'Пароли не совпадают',
      ]"
    >
      <template v-slot:append>
        <q-icon
          :name="isSecondPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isSecondPassword = !isSecondPassword"
        />
      </template>
    </q-input>
    <q-btn
      no-caps
      class="primary-btn"
      label="Сохранить"
      :style="'width: 300px'"
      :disabled="
        password.new_password.length === 0 ||
        password.new_password !== password.confirm_password
      "
      @click="changePassword"
    />
  </q-page>
</template>

<script lang="ts">
// core
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';

// interfaces
import { IPassword } from 'src/interfaces/users';

// constants
import { SUCCESS_IDENTITY_PASSWORD } from 'src/constants/notifications';

export default defineComponent({
  name: 'ResetPasswordPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const api = useAiplanStore();
    const { setNotificationView } = useNotificationStore();

    const isFirstPassword = ref(true);
    const isSecondPassword = ref(true);

    const { uidb64, token } = route.query;
    const password = ref<IPassword>({
      new_password: '',
      confirm_password: '',
    });

    const changePassword = async () => {
      if (!uidb64 || !token) return;

      await api
        .resetPassword(String(uidb64), String(token), password.value)
        .then(() => localStorage.clear())
        .then(() => {
          router.replace('/signin');

          setNotificationView({
            open: true,
            type: 'success',
            customMessage: SUCCESS_IDENTITY_PASSWORD,
          });
        });
    };

    return {
      password,
      isFirstPassword,
      isSecondPassword,
      changePassword,
    };
  },
});
</script>

<style lang="scss" scoped>
.fully-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
