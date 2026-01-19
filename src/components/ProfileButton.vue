<template>
  <q-btn
    style="padding: 0 !important; border: 0 !important"
    class="btn base-btn"
    flat
    v-if="user"
  >
    <q-popup-proxy
      transition-show="scale"
      transition-hide="scale"
      style="margin-top: 4px !important"
    >
      <q-list class="list-popup">
        <q-item
          clickable
          class="menu-card"
          data-id="profile-item"
          :to="`${
            router.currentRoute.value.fullPath.includes('no-workspace')
              ? '/no-workspace/profile'
              : '/profile'
          }`"
        >
          <p>Профиль</p>
        </q-item>
        <q-item
          v-if="user.is_superuser"
          clickable
          class="menu-card"
          :to="`/admin-panel/workspaces`"
        >
          <p>Админ. панель</p>
        </q-item>
        <q-separator />
        <q-item
          clickable
          data-id="sign-out-button"
          class="menu-card"
          @click="handleSignOut"
        >
          <p class="profile-button__exit-text" :style="'color: #c10015'">
            Выйти
          </p>
        </q-item>
        <q-item clickable class="menu-card" @click="handleSignOutEverywhere">
          <p class="profile-button__exit-text" :style="'color: #c10015'">
            Выйти из всех сессий
          </p>
        </q-item>
      </q-list>
    </q-popup-proxy>
    <AvatarImage
      :text="
        avatarText(user)
          .map((e) => (e ? e[0].toUpperCase() : e))
          .join(' ')
      "
      :tooltip="avatarText(user).join(' ')"
      :image="user.avatar_id"
      :rounded="false"
      noHat
      style="padding: 0 !important; border-radius: 8px !important"
    ></AvatarImage>
  </q-btn>
</template>

<script lang="ts">
// core
import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { LocalStorage, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useStatesStore } from 'src/stores/states-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
// utlis
import aiplan from 'src/utils/aiplan';

// components
import AvatarImage from './AvatarImage.vue';
import { useGlobalLoading } from 'src/composables/useGlobalLoader';

export default defineComponent({
  name: 'ProfileButton',
  components: {
    AvatarImage,
  },
  setup() {
    // stores
    const router = useRouter();
    const store = useAiplanStore();
    const userStore = useUserStore();
    const stateStore = useStatesStore();
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();
    const singleIssueStore = useSingleIssueStore();

    // store to ref
    const { user } = storeToRefs(userStore);
    const $q = useQuasar();
    const handleSignOut = async () => {
      useGlobalLoading();
      await store
        .signOut()
        .then(() => {
          userStore.clearUserState();
          LocalStorage.remove('next_url');
        })
        .then(() => {
          $q.dark.set(false);
          router.push('/signin');

          // reset all stores on sign-out
          userStore.$reset();
          stateStore.$reset();
          projectStore.$reset();
          workspaceStore.$reset();
          singleIssueStore.$reset();
        });
    };

    const handleSignOutEverywhere = async () => {
      await store
        .signOutEverywhere()
        .then(() => {
          LocalStorage.remove('next_url');
          userStore.clearUserState();
          router.push('/signin');
        })
        .then(() => {
          $q.dark.set(false);

          // reset all stores on sign-out
          userStore.$reset();
          stateStore.$reset();
          projectStore.$reset();
          workspaceStore.$reset();
          singleIssueStore.$reset();
        });
      return;
    };
    return {
      user,
      router,
      handleSignOut,
      handleSignOutEverywhere,
      avatarText: aiplan.UserName,
    };
  },
});
</script>
<style lang="scss">
.menu-card {
  width: 200px !important;

  p {
    margin: 8px 0;
  }
}
</style>
