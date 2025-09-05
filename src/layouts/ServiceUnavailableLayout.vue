<template>
  <!-- <img v-if="unstableRelease" src="/da_blyat.gif" class="fullscreen-gif" /> -->
  <q-layout view="lHh Lpr lFf relative">
    <q-page-container class="full">
      <div class="flex full fully-centered">
        Сервис временно недоступен. Повторите попытку позднее
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
// core
import { useMeta } from 'quasar';
import { useRouter } from 'vue-router';
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useUserStore } from 'src/stores/user-store';

export default defineComponent({
  name: 'ServiceUnavailableLayout',
  components: {},
  setup() {
    useMeta({
      title: 'АИПлан | Инструмент управления проектами.',
    });
    const userStore = useUserStore();

    const { user, userWorkspaces } = storeToRefs(userStore);
    const router = useRouter();
    const refreshInterval = ref();

    const userInfoRefresh = async () => {
      clearInterval(refreshInterval.value);
      refreshInterval.value = setInterval(async () => {
        await userStore.getUserInfo();
        if (user.value.last_workspace_slug)
          return router.push(`${user.value.last_workspace_slug}`);
        await userStore.getUserWorkspaces();
        if (userWorkspaces.value.length > 0)
          router.push(`${userWorkspaces.value[0].slug}`);
        else router.push('no-workspace');
      }, 5000);
    };

    onMounted(() => {
      userInfoRefresh();
    });

    onUnmounted(() => {
      clearInterval(refreshInterval.value);
    });

    const unstableRelease = ref(
      location.hostname === 'test.aiplan.aisa.ru' ||
        location.hostname === 'localhost',
    );

    return { unstableRelease };
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
.full {
  width: 100vw;
  height: 100vh;
}

.fullscreen-gif {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>
