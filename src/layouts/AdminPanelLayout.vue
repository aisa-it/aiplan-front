<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar class="header header-title-text">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title class="centered-horisontally"
          ><span class="body-text-md abbriviated-text">
            Админ. панель АИПлан
          </span></q-toolbar-title
        >
        <SearchPanel />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="sidebar">
      <NavMenu />
    </q-drawer>

    <q-page-container>
      <AdminPage />
    </q-page-container>
  </q-layout>

  <!-- <LoginPanel v-else></LoginPanel> -->
</template>

<script lang="ts">
// core
import { useRouter } from 'vue-router';
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useUserStore } from 'src/stores/user-store';
import { defineComponent, onBeforeMount, ref, watch, provide } from 'vue';
// helpers
import aiplan from 'src/utils/aiplan';

// components
import NavMenu from 'src/modules/admin-panel/navigation/NavMenu.vue';
import AdminPage from 'src/pages/AdminPage.vue';
import SearchPanel from 'src/components/search-panel/SearchPanel.vue';

export default defineComponent({
  name: 'AdminPanelLayout',
  components: {
    SearchPanel,
    NavMenu,
    AdminPage,
  },
  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const api = useAiplanStore();
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);
    const { auth } = storeToRefs(api);
    const $q = useQuasar();
    const me = ref(null);
    const theme = ref('light');
    provide('themeKey', theme);

    onBeforeMount(async () => {
      await api.usersMe();
      await userStore.getMe();
      await userStore.getUserWorkspaces();
      if (!user.value.is_superuser) router.push('/');

      me.value = api.me;
      if (userStore.getTheme === 'dark') {
        theme.value = 'dark';
        document.querySelector('body')?.setAttribute('data-theme', 'dark');
      } else if (me.value?.theme.contrast === true) {
        theme.value = 'visually-impaired';
        document
          .querySelector('body')
          ?.setAttribute('data-theme', 'visually-impaired');
      } else {
        theme.value = 'light';
        document.querySelector('body')?.setAttribute('data-theme', 'light');
      }
    });

    const setTheme = () => {
      if (user.value?.theme) {
        localStorage.setItem('dark', String(userStore.getTheme === 'dark'));
        $q.dark.set(userStore.getTheme === 'dark');
      } else $q.dark.set(JSON.parse(localStorage.getItem('dark') ?? 'false'));
    };

    watch(
      () => auth.value,
      () => {
        setTheme();
      },
      {
        deep: true,
      },
    );
    watch(
      () => user.value,
      () => {
        setTheme();
      },
      {
        deep: true,
      },
    );
    useMeta({
      title: 'АИПлан | Инструмент управления проектами.',
    });

    watch(
      () => $q.appVisible,
      () => userStore.getMe(),
    );
    return {
      api,
      auth,
      leftDrawerOpen,
      theme,
      me,
      avatarText: aiplan.UserName,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
