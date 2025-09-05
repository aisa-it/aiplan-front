<template>
  <q-layout view="lHh Lpr lFf relative">
    <q-page-container class="full">
      <q-page class="column items-center justify-center">
        <div class="column justify-center items-center q-pa-md">
          <h6 style="text-align: center">Доступ к данному разделу запрещен</h6>
          <q-btn
            class="primary-btn"
            unelevated
            no-caps
            :to="`/${currentRoute || 'no-workspace'}`"
          >
            <span class="q-pa-sm">
              Вернуться в последнее <br />
              пространство
            </span>
          </q-btn>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
export default defineComponent({
  name: 'AccessDenied',
  setup() {
    const workspaceStore = useWorkspaceStore();
    const userStore = useUserStore();
    const { user, userWorkspaces } = storeToRefs(userStore);

    onBeforeMount(async () => {
      workspaceStore.$reset();
      await userStore.getUserWorkspaces();
      await userStore.getUserInfo();
    });

    const currentRoute = computed(() => {
      let currentWsRoute = '';

      // проверяем есть ли доступен ли юзеру последний спейс
      if (userWorkspaces.value.length && user.value?.last_workspace_slug) {
        currentWsRoute = userWorkspaces.value.find(
          (ws) => ws.slug === user.value?.last_workspace_slug,
        )
          ? user.value?.last_workspace_slug
          : userWorkspaces.value[0]?.slug;
      }
      return currentWsRoute;
    });

    return { user, userWorkspaces, currentRoute };
  },
});
</script>
