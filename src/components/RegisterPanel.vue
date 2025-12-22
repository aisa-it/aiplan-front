<template>
  <q-form @submit="sendRegistrationRequest" class="flex column justify-center">
    <q-input
      class="base-input"
      dense
      v-model="email"
      label="Введите email"
      lazy-rules
      :rules="[
        (val) => (val && val.length > 0) || 'Необходимо ввести email',
        (val) => isEmail(val),
      ]"
    />
    <CaptchaWidget
      v-if="isEnabledCaptcha"
      @verified="(payload) => (captchaPayload = payload)"
      :key="updateKey"
    />
    <q-btn
      class="primary-btn full-w q-mt-sm"
      type="submit"
      no-caps
      :disable="
        email.length === 0 ||
        (isEnabledCaptcha && captchaPayload === '') ||
        isEmail(email) !== true
      "
      :loading="loading"
    >
      Зарегистрироваться
    </q-btn>
  </q-form>
</template>
<script lang="ts">
// core
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import { isEmail } from 'src/utils/validation';

// components
import CaptchaWidget from 'src/components/CaptchaWidget.vue';

// constants
import { SUCCESS_REGISTRATION_REQUEST } from 'src/constants/notifications';
import { useQuasar } from 'quasar';
import { useUtilsStore } from 'src/stores/utils-store';

export default defineComponent({
  name: 'RegisterPanel',
  emits: ['registerRequestSent'],
  components: { CaptchaWidget },

  setup(props, { emit }) {
    const api = useAiplanStore();
    const { setNotificationView } = useNotificationStore();
    const $q = useQuasar();
    const captchaPayload = ref('');
    const loading = ref(false);
    const updateKey = ref(0);
    const email = ref<string>('');
    const refreshInterval = ref();
    const userStore = useUserStore();
    const router = useRouter();
    const { isEnabledCaptcha } = storeToRefs(useUtilsStore());

    const sendRegistrationRequest = async () => {
      loading.value = true;
      await api
        .registerViaEmail(email.value, captchaPayload.value)
        .then(() => {
          loading.value = false;
          setNotificationView({
            open: true,
            type: 'success',
            customMessage: `${SUCCESS_REGISTRATION_REQUEST}${email.value}`,
          });
          emit('registerRequestSent');
        })
        .catch(() => {
          loading.value = false;
        })
        .finally(() => (updateKey.value += 1));
    };
    const workspaceStore = useWorkspaceStore();
    const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

    const tryToAuth = async () => {
      userStore.getUserInfo().then(async () => {
        router.push('/');
        await userStore.getUserWorkspaces();
        await workspaceStore.getWorkspaceInfo(currentWorkspaceSlug.value);
        await workspaceStore.getWorkspaceProjects(currentWorkspaceSlug.value);
      });
    };

    const intervalRefresh = () => {
      clearInterval(refreshInterval.value);
      refreshInterval.value = setInterval(() => tryToAuth(), 10000);
    };

    intervalRefresh();
    onBeforeMount(() => $q.dark.set(false));
    onMounted(() => tryToAuth());
    onUnmounted(() => clearInterval(refreshInterval.value));
    return {
      email,
      isEmail,
      loading,
      captchaPayload,
      sendRegistrationRequest,
      updateKey,
      isEnabledCaptcha,
    };
  },
});
</script>
