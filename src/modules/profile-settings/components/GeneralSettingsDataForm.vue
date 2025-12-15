<template>
  <q-form class="form-userdata" @submit="updateCurrentUser">
    <div
      class="row mobile-block form-userdata__row form-userdata__row_centered"
    >
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Аватар</h4>
        <p class="text-sm text-brand-secondary">
          Поддерживается .jpg, .png и .gif не более 20 Мб.
        </p>
      </div>
      <div class="col">
        <div class="row form-userdata__row form-userdata__row_centered">
          <q-img
            v-if="userInfo.avatar_id"
            :src="getUrlFile(userInfo.avatar_id)"
            class="q-ml-sm form-userdata__img"
          >
            <template #error>
              <div class="none-avatar text-avatar body-2">
                {{ userNameFirstSymbol }}
              </div>
            </template>
          </q-img>
          <template v-else>
            <div class="flex form-userdata__img none-avatar text-avatar body-2">
              {{ userNameFirstSymbol }}
            </div>
          </template>
          <div class="profile-settings-btn-wrapper q-ml-sm">
            <q-btn
              class="secondary-btn q-mr-sm"
              no-caps
              @click="toggleUploaderState"
            >
              Загрузить
            </q-btn>
            <q-btn
              v-if="userInfo?.avatar_id"
              class="delete-btn"
              no-caps
              @click="deleteUserAvatar"
            >
              Удалить
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <div class="row mobile-block form-userdata__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Полное имя</h4>
        <p class="text-sm text-brand-secondary">Ваши фамилия и имя</p>
      </div>

      <div class="col form-userdata__col">
        <div class="row form-userdata__inputs-row">
          <div class="col">
            <q-input
              v-model="userInfo.first_name"
              :rules="[
                (val) => isEmpty(val, 'имя'),
                (val) => notDefisOnly(val, 'Имя'),
                (val) => maxLength(val, 100),
                (val) => latinAndCyrillic(val, 'Имя пользователя'),
              ]"
              class="base-input"
              data-id="first-name-settings"
              label="Введите имя"
              lazy-rules
              hide-bottom-space
              dense
            />
          </div>
          <div class="col">
            <q-input
              v-model="userInfo.last_name"
              :rules="[
                (val) => isEmpty(val, 'фамилию'),
                (val) => notDefisOnly(val, 'Фамилия'),
                (val) => maxLength(val, 100),
                (val) => latinAndCyrillic(val, 'Фамилия пользователя'),
              ]"
              class="base-input"
              data-id="last-name-settings"
              label="Введите фамилию"
              lazy-rules
              hide-bottom-space
              dense
            />
          </div>
        </div>
      </div>
    </div>

    <div class="row mobile-block form-userdata__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Email</h4>
        <p class="text-sm text-brand-secondary">Ваш адрес электронной почты</p>
      </div>
      <div class="col row form-userdata__inputs-row form-userdata__col">
        <q-input
          v-model="new_email"
          :rules="[(val) => isEmail(val)]"
          class="base-input col"
          label="Введите email"
          lazy-rules
          hide-bottom-space
          dense
        />
        <div class="col">
          <q-btn
            class="secondary-btn form-userdata__btn"
            no-caps
            @click="changeEmail"
          >
            Изменить
          </q-btn>
        </div>
      </div>
    </div>

    <div class="row mobile-block form-userdata__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Имя пользователя</h4>
        <p class="text-sm text-brand-secondary">
          Ваше имя пользователя в системе
        </p>
      </div>
      <div class="col form-userdata__col">
        <q-input
          v-model="userInfo.username"
          :rules="[
            (val) => isEmpty(val, 'имя пользователя'),
            (val) => maxLength(val, 100),
            (val) => isUsername(val),
          ]"
          :error-message="errorMessageUserName"
          :error="isErrorUserName"
          class="base-input"
          data-id="user-name-settings"
          label="Введите имя пользователя"
          lazy-rules
          hide-bottom-space
          dense
          @update:model-value="handleUpdateUserName"
        />
      </div>
    </div>

    <div class="row mobile-block form-userdata__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Telegram ID</h4>
        <p class="text-sm text-brand-secondary">
          Ваш telegram id для получения уведомлений. Напишите
          <a :href="botURL">боту</a>
          для получения id
        </p>
      </div>
      <div class="col form-userdata__col">
        <q-input
          v-model="userInfo.telegram_id"
          :rules="[validateTelegramId]"
          class="base-input"
          data-id="telegram-id-settings"
          label="Введите Telegram ID"
          lazy-rules
          hide-bottom-space
          dense
        />
      </div>
    </div>
    <div class="row mobile-block form-userdata__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Часовой пояс</h4>
        <p class="text-sm text-brand-secondary">
          Ваш часовой пояс для отображения времени в уведомлениях
        </p>
      </div>
      <div class="col form-userdata__col">
        <q-select
          v-model="userInfo.user_timezone"
          :options="TIMEZONES"
          class="base-selector"
          popup-content-class="inh-popup scrollable-content"
          input-debounce="300"
          label="Ваш часовой пояс"
          fill-input
          map-options
          emit-value
          dense
        />
      </div>
    </div>
    <div class="row mobile-block form-userdata__row">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Токен</h4>
        <p class="text-sm text-brand-secondary">Токен для авторизации</p>
      </div>
      <div class="col form-userdata__col">
        <q-input
          v-model="authToken"
          :type="isToken ? 'password' : 'text'"
          class="base-input"
          readonly
          hide-bottom-space
          dense
        >
          <template v-slot:append>
            <q-icon
              :name="isToken ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="toggleToken"
            />
          </template>

          <template v-slot:after>
            <q-btn
              data-id="reset-token-settings"
              class="delete-btn q-mr-sm"
              icon="lock_reset"
              @click="handleResetProfileToken"
            />
            <q-btn
              data-id="copy-token-settings"
              class="secondary-btn-only-icon"
              icon="content_copy"
              @click="handleCopyProfileToken"
            />
          </template>
        </q-input>
      </div>
    </div>
    <q-btn
      :disable="!(user.first_name && user.last_name)"
      data-id="save-button-settings"
      class="secondary-btn form-userdata__btn"
      type="submit"
      no-caps
    >
      Сохранить
    </q-btn>

    <UploadUserAvatarDialog
      v-model="isUploaderOpen"
      @start-loading="loading = true"
      @refresh="handleRefreshAvatar"
      @error="loading = false"
    />
    <q-inner-loading :showing="loading">
      <DefaultLoader />
    </q-inner-loading>
  </q-form>
</template>

<script setup lang="ts">
// core
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useNotificationStore } from 'src/stores/notification-store';
// constants
import { TIMEZONES } from 'src/constants/constants';
// components
import UploadUserAvatarDialog from 'src/components/dialogs/UploadUserAvatarDialog.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
// validation
import {
  isEmpty,
  maxLength,
  isUsername,
  notDefisOnly,
  latinAndCyrillic,
  isEmail,
} from 'src/utils/validation';
// composables
import { useFormToken } from '../composables/general-profile-settings/useFormToken';
import { useFormAvatar } from '../composables/general-profile-settings/useFormAvatar';
import { useFormUserdata } from '../composables/general-profile-settings/useFormUserdata';
// utils
import { getUrlFile } from 'src/utils/helpers';
// types
import { IUser } from 'src/interfaces/users';

import { api } from '../services/api';

// stores
const userStore = useUserStore();
const utilsStore = useUtilsStore();
const { setNotificationView } = useNotificationStore();
// storeToRefs
const { user } = storeToRefs(userStore);
const { botURL } = storeToRefs(utilsStore);

// Объект для редактирования данных пользователя
const userInfo = ref({
  email: '',
  username: '',
  avatar: '',
  first_name: '',
  last_name: '',
  telegram_id: null,
  user_timezone: '',
} as Partial<IUser>);

const new_email = ref('');

// composables
// Форма настроек пользователя
const {
  isUploaderOpen,
  errorMessageUserName,
  isErrorUserName,
  userNameFirstSymbol,
  toggleUploaderState,
  validateTelegramId,
  handleUpdateUserName,
  updateCurrentUser,
} = useFormUserdata(userInfo);
// Аватар в форме пользователя
const { loading, handleRefreshAvatar, deleteUserAvatar } =
  useFormAvatar(userInfo);
// Токен в форме пользователя
const {
  authToken,
  isToken,
  toggleToken,
  handleCopyProfileToken,
  handleResetProfileToken,
} = useFormToken();

const changeEmail = async () => {
  if (!new_email.value) return;
  new_email.value = new_email.value.trim();

  await api.changeMyEmail({ new_email: new_email.value }).then(() => {
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Ссылка для подтверждения отправлена на указанный email',
    });
  });
};

// Получаем актуальную информацию о пользователе
onMounted(async () => {
  await userStore.getAuthToken();
  await utilsStore.getNotificationBotUrl();

  userInfo.value = JSON.parse(JSON.stringify(user.value));
  new_email.value = userInfo.value.email ?? '';
});

watch(
  () => user.value,
  async (newValue) => {
    if (newValue) {
      userInfo.value = JSON.parse(JSON.stringify(user.value));
    }
  },
);
</script>

<style scoped lang="scss">
.form-userdata {
  display: flex;
  gap: 16px;
  flex-direction: column;

  &__row {
    gap: 8px;

    &_centered {
      align-items: center;
    }
  }

  &__inputs-row {
    gap: 8px;
  }

  &__col {
    margin: 0.375em 0;
  }

  &__img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    color: white;
  }

  &__btn {
    margin-left: auto;
  }
}

@media screen and (width < 600px) {
  .form-userdata {
    &__inputs-row {
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
