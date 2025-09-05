<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        :class="`header main-toolbar row ${
          router.currentRoute.value.fullPath.includes('profile')
            ? 'justify-between'
            : 'justify-end'
        }`"
      >
        <q-btn
          v-if="router.currentRoute.value.fullPath.includes('profile')"
          no-caps
          class="secondary-btn"
          @click="router.replace('/no-workspace')"
        >
          Назад
        </q-btn>

        <ProfileButton data-id="profile-button-no-workspace" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <RouterView />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useMeta, useQuasar } from 'quasar';
import {
  defineComponent,
  onBeforeMount,
  ref,
  onUnmounted,
  watch,
  watchEffect,
} from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';

// utils
import aiplan from 'src/utils/aiplan';

// components
import ProfileButton from 'src/components/ProfileButton.vue';
import { stopGlobalLoading } from 'src/composables/useGlobalLoader';

export default defineComponent({
  name: 'NoWorkspaceLayout',
  components: {
    ProfileButton,
  },
  setup() {
    // stores
    const userStore = useUserStore();
    const utilsStore = useUtilsStore();

    const { user, userWorkspaces } = storeToRefs(userStore);
    // drawer var
    const leftDrawerOpen = ref(false);
    const router = useRouter();
    const $q = useQuasar();
    const refreshInterval = ref();

    const userInfoRefresh = async () => {
      clearInterval(refreshInterval.value);
      refreshInterval.value = setInterval(
        async () => await userStore.getUserInfo(),
        5000,
      );
    };

    // hooks
    onBeforeMount(async () => {
      await Promise.all([
        userStore.getUserInfo(),
        utilsStore.getVersion(),
        userStore.getUserWorkspaces(),
        userInfoRefresh,
      ]);
      stopGlobalLoading();
      if (user.value?.theme) {
        localStorage.setItem('dark', String(userStore.getTheme === 'dark'));
        $q.dark.set(userStore.getTheme === 'dark');
      } else $q.dark.set(false);
      if (userWorkspaces.value.length > 0) {
        router.replace(
          `/${
            user.value?.last_workspace_slug ||
            userWorkspaces.value[0]?.slug ||
            'no-workspace'
          }`,
        );
      }
    });

    onUnmounted(() => {
      clearInterval(refreshInterval.value);
    });

    watch(
      () => $q.appVisible,
      () => userStore.getUserInfo(),
    );
    watchEffect(() => {
      if (user.value?.last_workspace_slug) router.push('/');
    });
    // metadata
    useMeta({
      title: 'АИПлан | Инструмент управления проектами.',
    });

    return {
      router,
      leftDrawerOpen,
      avatarText: aiplan.UserName,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
