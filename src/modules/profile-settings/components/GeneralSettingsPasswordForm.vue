<template>
  <q-form class="form-password" @submit="changePassword">
    <h3 class="form-password__heading">Смена пароля</h3>
    <div class="row mobile-block form-password__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Новый пароль</h4>
        <p class="text-sm text-brand-secondary">Введите новый пароль</p>
      </div>
      <q-input
        v-model="password.new_password"
        :type="isNewPassword ? 'password' : 'text'"
        :rules="[(val) => isEmpty(val, 'пароль')]"
        class="base-input form-password__col col"
        data-id="new-password-settings"
        label="Введите пароль"
        lazy-rules
        dense
      >
        <template v-slot:append>
          <q-icon
            :name="isNewPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isNewPassword = !isNewPassword"
          />
        </template>
      </q-input>
    </div>
    <div class="row mobile-block form-password__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">
          Новый пароль (повторно)
        </h4>
        <p class="text-sm text-brand-secondary">Введите новый пароль ещё раз</p>
      </div>
      <q-input
        v-model="password.confirm_password"
        :type="isRepeatNewPassword ? 'password' : 'text'"
        :rules="[
          (val) => isEmpty(val, 'пароль'),
          (val: string) =>
            val === password.new_password || 'Пароли не совпадают',
        ]"
        class="base-input form-password__col col"
        data-id="repeat-password-settings"
        label="Введите пароль"
        lazy-rules
        hide-bottom-space
        dense
      >
        <template v-slot:append>
          <q-icon
            :name="isRepeatNewPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isRepeatNewPassword = !isRepeatNewPassword"
          />
        </template>
      </q-input>
    </div>

    <q-btn
      :disable="
        !(password.new_password && password.confirm_password) ||
        password.new_password !== password.confirm_password
      "
      class="form-password__btn secondary-btn"
      data-id="change-password-settings"
      type="submit"
      no-caps
    >
      Сменить пароль
    </q-btn>
  </q-form>
</template>

<script setup lang="ts">
import { isEmpty } from 'src/utils/validation';
import { useFormPassword } from '../composables/general-profile-settings/useFormPassword';

const { password, isNewPassword, isRepeatNewPassword, changePassword } =
  useFormPassword();
</script>

<style scoped lang="scss">
.form-password {
  display: flex;
  gap: 16px;
  flex-direction: column;
  padding-top: 16px;

  &__heading {
    margin: 0;
  }

  &__row {
    gap: 8px;
  }

  &__col {
    margin: 0.375em 0;
  }

  &__btn {
    margin-left: auto;
  }
}
</style>
