<template>
  <div class="fullscreen flex flex-center">
    <div>
      <div
        style="
          font-size: 30vh;
          font-size: 200px;
          font-weight: 300;
          line-height: 237px;
          letter-spacing: -3.885964870452881px;
          text-align: center;
        "
      >
        404
      </div>

      <div
        style="
          font-size: 32px;
          font-weight: 400;
          line-height: 37.92px;
          letter-spacing: -0.6221134066581726px;
          text-align: center;
        "
      >
        Страница не найдена
      </div>

      <div class="row justify-center">
        <q-btn
          class="q-mt-xl primary-btn"
          unelevated
          label="Вернуться на главную"
          no-caps
          @click="
            $router.push(
              `/${
                user?.last_workspace_slug ||
                userWorkspaces[0]?.slug ||
                'no-workspace'
              }`,
            )
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { LocalStorage } from 'quasar';
import { stopGlobalLoading } from 'src/composables/useGlobalLoader';
export default defineComponent({
  name: 'ErrorNotFoundPage',
  setup() {
    const userStore = useUserStore();
    const workspaceStore = useWorkspaceStore();
    const { user, userWorkspaces } = storeToRefs(userStore);
    const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
    onMounted(async () => {
      LocalStorage.remove('next_url');
      workspaceStore.$reset();
      await userStore.getUserInfo();
    });

    onBeforeMount(() => {
      stopGlobalLoading();
    });
    return { user, userWorkspaces };
  },
});
</script>
