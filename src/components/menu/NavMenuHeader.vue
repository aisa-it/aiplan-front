<template>
  <q-btn-group
    flat
    spread
    v-if="userWorkspaces.length > 0 && workspaceInfo && user"
    style="height: 50px; min-height: 50px"
    class="border-radius-inherit header"
  >
    <q-btn class="nav-menu__top-nav-button w-full" no-caps>
      <q-avatar
        data-id="workspace-avatar"
        :size="'32px'"
        :square="true"
        :class="{
          avatar: true,
          'none-avatar': !workspaceInfo.logo,
          square: true,
        }"
      >
        <q-img
          :src="workspaceInfo.logo ? getUrlFile(workspaceInfo.logo) : ''"
          v-if="workspaceInfo.logo"
          spinner-size="32px"
          :style="'object-fit: cover; width: 100%; height: 100%; background-color: white; color: white'"
        >
          <template #error>
            <div class="none-avatar text-avatar">
              {{ getFirstSymbol(workspaceInfo.name) }}
            </div>
          </template>
        </q-img>
        <div
          v-else
          :style="`font-size: 0.75rem; line-height: 0.75rem; text-align: center;`"
        >
          {{ getFirstSymbol(workspaceInfo.name) }}
        </div>
        <HatXmasIcon
          v-if="ny"
          :class="ny ? 'q-mt-xs hat-overlay' : 'hat-overlay'"
          :width="36"
          :height="36"
          :style="
            userStore.getTheme === 'light'
              ? 'filter: drop-shadow(-3px -1px 4px rgba(0, 0, 0, 0.7));'
              : ''
          "
        />
      </q-avatar>

      <q-popup-proxy
        transition-show="scale"
        transition-hide="scale"
        class="hide-scrollbar"
      >
        <q-list class="list-popup nav-menu">
          <q-item
            data-id="create-new-space-button"
            class="nav-menu-el justify-between centered-horisontally"
            clickable
            :disable="isNewSpaceModalOpen"
            @click="isNewSpaceModalOpen = !isNewSpaceModalOpen"
          >
            <span>Пространства</span>
            <q-icon name="add" dense style="margin-left: auto" />
          </q-item>
          <q-item
            v-for="s in userWorkspaces"
            clickable
            exact
            class="nav-menu-el items-center no-wrap"
            :style="`${
              s.slug === currentWorkspaceSlug
                ? 'cursor: default !important'
                : 'cursor: pointer'
            }`"
            :active="s.slug === currentWorkspaceSlug"
            :key="s.id"
            :to="`${'/' + s.slug}`"
            :class="
              s.slug === currentWorkspaceSlug ? 'q-router-link--active' : ''
            "
            @click="
              router.currentRoute.value.params.workspace !== s.slug ? useGlobalLoading() : ''
            "
          >
            <q-item-section avatar>
              <div>
                <AvatarImage
                  :text="s.name[0]"
                  :tooltip="s.name"
                  :image="s.logo ? s.logo : ''"
                  :rounded="false"
                />
              </div>
            </q-item-section>
            <q-item-section class="nav-menu__el-name on-left q-pr-md">
              {{ s.name }}
            </q-item-section>
            <q-space />
            <div style="display: flex; align-items: center">
              <q-btn
                class="menu-link__btn q-mr-sm"
                :class="{ 'favorite-btn--inactive': !s.is_favorite }"
                flat
                :style="'min-height: 16px !important; min-width: 16px; padding: 0'"
                @click.prevent.stop
              >
                <StarIcon
                  :width="16"
                  :height="16"
                  :color="s.is_favorite ? '#F2994A' : ''"
                  @click="
                    () =>
                      s.is_favorite
                        ? deleteFavoriteWorkspace(s.id)
                        : addFavoriteWorkspace(s.id)
                  "
                />
                <HintTooltip v-if="s.is_favorite"
                  >Убрать из избранного</HintTooltip
                >
                <HintTooltip v-else>Добавить в избранное</HintTooltip>
              </q-btn>
              <div class="flex" style="min-width: 16px">
                <q-btn
                  v-if="hasPermissionByWorkspace(s, 'ws-settings')"
                  class="menu-link__settings-btn"
                  flat
                  dense
                  no-caps
                  id="workspace-settings-button"
                  :style="'min-height: 16px !important; padding: 0'"
                  :to="`/${s.slug}/settings`"
                >
                  <SettingsIcon :width="16" :height="16" />
                  <HintTooltip>Настройки</HintTooltip>
                </q-btn>
              </div>
            </div>
          </q-item>
          <q-separator />
        </q-list>
      </q-popup-proxy>
    </q-btn>

    <q-btn class="nav-menu__top-nav-button" :to="`/${currentWorkspaceSlug}`">
      <HomeIcon
        :color="`${
          router.currentRoute.value.path === `/${currentWorkspaceSlug}` ? activeIconColor : ''
        }`"
      />
    </q-btn>

    <q-btn
      :disable="isDemo"
      class="nav-menu__top-nav-button"
      :to="`/${currentWorkspaceSlug}/aidoc`"
    >
      <AIDocIcon
        :color="`${router.currentRoute.value.path.includes('aidoc') ? activeIconColor : ''}`"
      />
    </q-btn>
    <q-btn
      v-if="gitStore.gitEnabled"
      class="nav-menu__top-nav-button"
      data-id="git-repositories-button"
      :text-color="'dark'"
      @click="navigateToGit"
    >
      <GitIcon
        :color="`${router.currentRoute.value.path.includes('/git') ? activeIconColor : ''}`"
      />
      <q-tooltip>Git Repositories</q-tooltip>
    </q-btn>
    <q-btn
      class="nav-menu__top-nav-button"
      data-id="workspace-settings-button-top"
      :text-color="'dark'"
      @click="notificationSettingsOpen = !notificationSettingsOpen"
    >
      <BellIcon :color="`${notificationSettingsOpen ? activeIconColor : ''}`" />
    </q-btn>
  </q-btn-group>
  <NewWorkspaceDialog v-model="isNewSpaceModalOpen" />
  <NotificationsWorkspaceSettingsDialog v-model="notificationSettingsOpen" />
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// store
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useGitStore } from 'src/stores/git-store';

// utils
import { getUrlFile, getFirstSymbol } from 'src/utils/helpers';

//components
import HomeIcon from '../icons/HomeIcon.vue';
import AvatarImage from '../AvatarImage.vue';
import HatXmasIcon from '../icons/HatXmasIcon.vue';
import SettingsIcon from '../icons/SettingsIcon.vue';
import BellIcon from '../icons/BellIcon.vue';
import GitIcon from '../icons/GitIcon.vue';
import NewWorkspaceDialog from '../dialogs/NewWorkspaceDialog.vue';
import StarIcon from 'components/icons/StarIcon.vue';
import {
  BASE_ERROR,
  SUCCESS_ADD_WORKSPACE_TO_FAVORITE,
  SUCCESS_REMOVE_WORKSPACE_FROM_FAVORITE,
} from 'src/constants/notifications';
import { useNotificationStore } from 'stores/notification-store';
import { useUtilsStore } from 'src/stores/utils-store';
import AIDocIcon from '../icons/AIDocIcon.vue';
import { useGlobalLoading } from 'src/composables/useGlobalLoader';
import NotificationsWorkspaceSettingsDialog from '../dialogs/NotificationsWorkspaceSettingsDialog.vue';

const activeIconColor = '#3f75ff';

// stores
const userStore = useUserStore();
const utilsStore = useUtilsStore();
const workspaceStore = useWorkspaceStore();
const gitStore = useGitStore();
const { hasPermission, hasPermissionByWorkspace } = useRolesStore();

// store to refs
const { user, userWorkspaces } = storeToRefs(userStore);
const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { ny, isDemo } = storeToRefs(utilsStore);
// router
const router = useRouter();

// dialogs vars
const isNewSpaceModalOpen = ref(false);
const notificationSettingsOpen = ref(false);
const { setNotificationView } = useNotificationStore();

const deleteFavoriteWorkspace = async (uuid: string | undefined) => {
  await userStore
    .deleteFavoriteWorkspace(uuid)
    .then(() => {
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_REMOVE_WORKSPACE_FROM_FAVORITE,
      });
    })
    .catch(() => {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: BASE_ERROR,
      });
    });
};

const addFavoriteWorkspace = async (uuid: string | undefined) => {
  await userStore
    .addFavoriteWorkspace({ workspace: uuid })
    .then(() => {
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_ADD_WORKSPACE_TO_FAVORITE,
      });
    })
    .catch(() => {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: BASE_ERROR,
      });
    });
};

/**
 * Обработчик клика по иконке Git
 *
 * Переход на главную страницу Git расширения
 * @see src/modules/git/pages/GitHomePage.vue
 */
const navigateToGit = () => {
  router.push({
    name: 'git-home',
    params: {
      workspace: currentWorkspaceSlug.value,
    },
  });
};
</script>
<style lang="scss" scoped>
.right-icon {
  flex: none;
  display: block !important;
  padding-top: 8px;
  margin-left: 8px;
}

.projects-list-wrapper {
  max-height: 80vh;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  @media screen and (max-height: 700px) and (min-height: 500px) {
    max-height: 70vh;
  }
  @media screen and (max-height: 499px) and (min-height: 400px) {
    max-height: 60vh;
  }
  @media screen and (max-height: 399px) and (min-height: 300px) {
    max-height: 50vh;
  }
}

.nav-menu__add-new-space-btn {
  margin: 8px 0;
}
.none-avatar {
  background-color: #ccdbff;
  color: $primary;
}
.square {
  border-radius: 8px;
}

.q-btn {
  background: none;
}
.favorite-btn--inactive {
  opacity: 0;
  @media (max-width: 768px) {
    opacity: 1;
  }
}
.nav-menu__el-name {
  display: block;
  flex: 1 1 auto;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}
.nav-menu-el:hover .favorite-btn--inactive {
  opacity: 1;
}

.hat-overlay {
  position: absolute;
  top: -65%;
  left: 30%;
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10;
}
</style>
