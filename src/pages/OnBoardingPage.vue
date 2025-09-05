<template>
  <q-page class="fully-centered">
    <q-form @submit="handleSaveName" class="onboarding-form">
      <h6>Необходимо ввести Ваши данные</h6>
      <q-input
        ref="firstName"
        dense
        data-id="first-name-onboarding"
        v-model="me.first_name"
        class="base-input onboarding-input"
        label="Введите имя"
        lazy-rules
        :rules="[
          (val) => isEmpty(val, 'имя'),
          (val) => notDefisOnly(val, 'Имя'),
          (val) => maxLength(val, 100),
          (val) => latinAndCyrillic(val, 'Имя пользователя'),
        ]"
      />
      <q-input
        ref="lastName"
        dense
        data-id="last-name-onboarding"
        class="base-input onboarding-input"
        v-model="me.last_name"
        label="Введите фамилию"
        lazy-rules
        :rules="[
          (val) => isEmpty(val, 'фамилию'),
          (val) => notDefisOnly(val, 'Фамилия'),
          (val) => maxLength(val, 100),
          (val) => latinAndCyrillic(val, 'Фамилия пользователя'),
        ]"
      />
      <q-input
        ref="username"
        dense
        data-id="user-name-onboarding"
        class="base-input onboarding-input"
        v-model="me.username"
        label="Введите имя пользователя"
        lazy-rules
        :rules="[
          (val) => isEmpty(val, 'имя пользователя'),
          (val) => maxLength(val, 100),
          (val) => isUsername(val),
        ]"
        :error="isErrorUserName"
        :error-message="errorMessageUserName"
        @update:model-value="handleUpdateUserName"
      />
      <q-card-actions align="center">
        <q-btn
          no-caps
          unelevated
          data-id="save-name"
          class="primary-btn"
          label="Сохранить"
          type="submit"
        >
        </q-btn>
      </q-card-actions>
    </q-form>
  </q-page>
</template>

<script lang="ts">
// core
import { defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

// stores
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useUserStore } from 'src/stores/user-store';

// utils
import {
  isEmpty,
  maxLength,
  isUsername,
  notDefisOnly,
  latinAndCyrillic,
} from 'src/utils/validation';

// constants
import { ERROR_IDENTITY_USER } from 'src/constants/notifications';

export default defineComponent({
  name: 'OnBoardingPage',
  setup() {
    // router
    const router = useRouter();

    // stores
    const api = useAiplanStore();
    const userStore = useUserStore();

    // store to refs
    const { user, userWorkspaces } = storeToRefs(userStore);

    // vars
    const $q = useQuasar();
    const lastName = ref();
    const firstName = ref();
    const username = ref();
    const me = ref({
      last_name: '',
      first_name: '',
      username: '',
    });
    const isErrorUserName = ref<boolean>(false);
    const errorMessageUserName = ref<string>('');

    watch(
      () => user.value,
      () => {
        me.value = {
          last_name: user.value?.last_name ?? '',
          first_name: user.value?.first_name ?? '',
          username: user.value?.username ?? '',
        };

        isErrorUserName.value = false;
        errorMessageUserName.value = '';
      },
    );

    const goForward = async () => {
      await userStore
        .getUserWorkspaces()
        .then(() =>
          router.replace(
            `/${
              user.value?.last_workspace_slug ||
              userWorkspaces.value[0]?.slug ||
              'no-workspace'
            }`,
          ),
        );
    };

    const handleSaveName = async () => {
      lastName.value.validate();
      firstName.value.validate();
      username.value.validate();
      if (
        firstName.value.hasError &&
        lastName.value.hasError &&
        username.value.hasError
      )
        return;

      await api
        .setNameFromOnboard(me.value)
        .then(async () => {
          await goForward();
        })
        .catch(async (err) => {
          if (err.response.status === 409 && err.response.data.code === 6002) {
            isErrorUserName.value = true;
            errorMessageUserName.value = ERROR_IDENTITY_USER;
            return;
          }

          err.response.status === 304 ? await goForward() : null;
        });
    };

    const handleUpdateUserName = () => {
      isErrorUserName.value = false;
      errorMessageUserName.value = '';
    };

    watch(
      () => $q.appVisible,
      () => {
        userStore.getUserInfo().then((data) => {
          return data;
        });
      },
    );

    return {
      me,
      lastName,
      firstName,
      username,
      isErrorUserName,
      errorMessageUserName,

      handleSaveName,

      isEmpty,
      maxLength,
      isUsername,
      notDefisOnly,
      latinAndCyrillic,
      handleUpdateUserName,
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

.onboarding-form {
  width: 500px;
}
.onboarding-input {
  margin-bottom: 10px;
}
:deep(.q-field--error .q-field__bottom) {
  width: 600px;
}
:deep(.q-card__actions) {
  padding: 12px !important;
}

@media screen and (max-width: 720px) {
  .onboarding-form {
    width: 90vw;
  }
  :deep(.q-field--error .q-field__bottom) {
    width: 90vw;
  }
}

@media screen and (max-width: 480px) {
  .onboarding-input {
    margin-bottom: 22px;
  }
}
</style>
