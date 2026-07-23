<template>
  <q-drawer
    v-model="drawer"
    show-if-above
    :mini="!drawer || miniState"
    :width="isMobile ? DEFAULT_WIDTH : adaptiveWidth"
    :breakpoint="500"
    bordered
    class="main-nav-bar"
    @mouseenter="isBtnShow = true"
    @mouseleave="isBtnShow = false"
    @before-show="updateClientWidth"
  >
    <div class="column full-height">
      <q-scroll-area class="col" :horizontal-thumb-style="{ opacity: 0 }">
        <q-list>
          <q-item
            clickable
            v-ripple
            :active="route.name === 'workspace'"
            :to="{
              name: 'workspace',
              params: { workspace: currentWorkspaceSlug },
            }"
          >
            <q-item-section avatar>
              <HomeIcon
                :color="route.name === 'workspace' ? ACTIVE_ICON_COLOR : ''"
              />
            </q-item-section>

            <q-item-section> Главная </q-item-section>
          </q-item>

          <q-item
            v-for="item in orderedItems"
            :key="item.id"
            :active="route.path === item.id"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <component
                :is="item.icon"
                :color="route.path.includes(item.id) ? ACTIVE_ICON_COLOR : ''"
              />
            </q-item-section>

            <q-item-section> {{ item.name }} </q-item-section>

            <q-item-section side>
              <q-icon name="expand_more" size="16px" />
            </q-item-section>

            <component :is="item.component" />
          </q-item>

          <q-item
            :active="route.path.includes('/aidoc')"
            clickable
            v-ripple
            @click="router.push(`/${currentWorkspaceSlug}/aidoc`)"
          >
            <q-item-section avatar>
              <AIDocIcon
                :color="route.path.includes('/aidoc') ? ACTIVE_ICON_COLOR : ''"
              />
            </q-item-section>

            <q-item-section> АИДок </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-list class="col-auto">
        <ExpansionItem v-if="!miniState" type="help" itemName="help">
          <template v-slot:header>
            <q-item-section avatar>
              <HelpIcon />
            </q-item-section>
            <q-item-section> Помощь и поддержка </q-item-section>
          </template>

          <template v-slot:content>
            <NavBarHelpList
              @open-help="isHelpOpen = !isHelpOpen"
              @open-feedback="isFeedbackOpen = !isFeedbackOpen"
              @open-release="isReleaseOpen = !isReleaseOpen"
            />
          </template>
        </ExpansionItem>

        <q-item v-else clickable v-ripple>
          <q-item-section avatar>
            <HelpIcon />
          </q-item-section>

          <q-menu anchor="top right" self="top left" :offset="[5, 0]">
            <NavBarHelpList
              style="min-width: 200px"
              @open-help="isHelpOpen = !isHelpOpen"
              @open-feedback="isFeedbackOpen = !isFeedbackOpen"
              @open-release="isReleaseOpen = !isReleaseOpen"
            />
          </q-menu>
        </q-item>
      </q-list>
    </div>

    <div class="absolute" style="top: 15px; right: -10px">
      <q-btn
        v-show="isBtnShow"
        class="drawer-btn"
        :icon="miniState ? 'chevron_right' : 'chevron_left'"
        @click="onDrawerBtnClick"
      />
    </div>

    <AiplanHelpDialog v-model="isHelpOpen" />
    <FeedbackDialog
      v-model="isFeedbackOpen"
      @success="(msg) => onSuccess(msg)"
    />
    <ReleaseNotePreviewDialog v-model="isReleaseOpen" />
    <div
      v-show="!miniState"
      class="handle-resize"
      @pointerdown="onPointerDown"
    ></div>
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { computed, ref, onMounted, watch, markRaw } from 'vue';
import { LocalStorage, Screen, useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

// services
import { useNotificationStore } from 'src/stores/notification-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';
import { useRolesStore } from 'src/stores/roles-store';

// icons
import HomeIcon from '../icons/HomeIcon.vue';
import AIDocIcon from '../icons/AIDocIcon.vue';
import SprintIcon from '../icons/SprintIcon.vue';
import MenuFormsIcon from '../icons/MenuFormsIcon.vue';
import MenuProjectsIcon from '../icons/MenuProjectsIcon.vue';
import HelpIcon from '../icons/HelpIcon.vue';

// components
import FeedbackDialog from 'src/components/dialogs/FeedbackDialog.vue';
import AiplanHelpDialog from 'src/components/dialogs/AiplanHelp/AiplanHelpDialog.vue';
import ReleaseNotePreviewDialog from 'components/dialogs/ReleaseNotePreviewDialog.vue';
import ExpansionItem from '../ExpansionItem.vue';
import NavBarHelpList from './NavBarHelpList.vue';
import NavPopupProjects from 'src/components/nav-popups/NavPopupProjects.vue';
import NavPopupSprints from 'src/components/nav-popups/NavPopupSprints.vue';
import NavPopupForms from 'src/components/nav-popups/NavPopupForms.vue';

import { useDrawerResize } from 'src/composables/useDrawerResize';

const props = defineProps<{
  miniState: boolean;
}>();

const emits = defineEmits<{
  'update:miniState': [boolean];
}>();

const $q = useQuasar();
const drawer = ref(true);

const router = useRouter();
const route = useRoute();

const { setNotificationView } = useNotificationStore();
const { hasPermissionByWorkspace } = useRolesStore();

const isHelpOpen = ref(false);
const isFeedbackOpen = ref(false);
const isReleaseOpen = ref(false);
const isBtnShow = ref(false);

const ACTIVE_ICON_COLOR = '#3f75ff';
const DEFAULT_WIDTH = 270;

const defaultOrder = ['projects', 'sprints', 'forms'];
const ORDER_KEY = computed(() => `${route.params.workspace}_menu`);
const savedOrder = computed(
  () => LocalStorage.getItem<string[]>(ORDER_KEY.value) || defaultOrder,
);

type MenuItem = {
  id: string;
  component: any;
  icon: any;
  name: string;
  condition: () => boolean;
};

const itemsMap: Record<string, MenuItem> = {
  projects: {
    id: 'projects',
    component: markRaw(NavPopupProjects),
    icon: markRaw(MenuProjectsIcon),
    name: 'Проекты',
    condition: () => true,
  },
  sprints: {
    id: 'sprints',
    component: markRaw(NavPopupSprints),
    icon: markRaw(SprintIcon),
    name: 'Спринты',
    condition: () =>
      !!workspaceInfo.value &&
      hasPermissionByWorkspace(workspaceInfo.value, 'show-sprints-nav'),
  },
  forms: {
    id: 'forms',
    component: markRaw(NavPopupForms),
    icon: markRaw(MenuFormsIcon),
    name: 'Формы',
    condition: () =>
      !!workspaceInfo.value &&
      hasPermissionByWorkspace(workspaceInfo.value, 'show-forms-nav'),
  },
};

const clientWidth = ref(document.documentElement.clientWidth);
const isMobile = computed(() => {
  return $q.platform.is.mobile && Screen.lt.md;
});
const minWidth = computed(() => DEFAULT_WIDTH);
const maxWidth = computed(() =>
  isMobile.value ? DEFAULT_WIDTH : clientWidth.value / 2,
);
const { adaptiveWidth, onPointerDown, updateClientWidth } = useDrawerResize(
  minWidth,
  maxWidth,
  clientWidth,
  'menuSidebarWidth',
  'left',
);

const onDrawerBtnClick = () => emits('update:miniState', !props.miniState);

const onSuccess = (msg?: string) => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
};

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug, workspaceInfo } = storeToRefs(workspaceStore);

const orderedItems = computed(() => {
  const sortedItems = savedOrder.value
    .map((key) => itemsMap[key])
    .filter((item) => item !== undefined);

  const remainingKeys = Object.keys(itemsMap).filter(
    (key) => !savedOrder.value.includes(key),
  );
  const remainingItems = remainingKeys.map((key) => itemsMap[key]);

  return [...sortedItems, ...remainingItems].filter((el) => {
    return el.condition();
  });
});

onMounted(() => {
  if (currentWorkspaceSlug.value) {
    workspaceStore.getWorkspaceSummary(currentWorkspaceSlug.value);
  }
});

watch(currentWorkspaceSlug, (newSlug) => {
  if (newSlug) {
    workspaceStore.getWorkspaceSummary(newSlug);
  }
});
</script>

<style scoped>
.handle-resize {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 6px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.drawer-btn {
  z-index: 1000;
}
</style>
