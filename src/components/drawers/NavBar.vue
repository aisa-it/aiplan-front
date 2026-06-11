<template>
  <q-drawer
    v-model="drawer"
    show-if-above
    :mini="!drawer || miniState"
    :width="270"
    :breakpoint="500"
    bordered
    class="main-nav-bar"
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
              <HomeIcon />
            </q-item-section>

            <q-item-section> Главная </q-item-section>
          </q-item>

          <q-item :active="route.name === 'projects'" clickable v-ripple>
            <q-item-section avatar>
              <MenuProjectsIcon :is-dark="$q.dark.isActive" />
            </q-item-section>

            <q-item-section> Проекты </q-item-section>

            <q-item-section side>
              <q-icon name="expand_more" size="16px" />
            </q-item-section>

            <q-menu anchor="top end" self="top start" :offset="[8, 0]" max-height="70vh">
              <NavPopupProjects />
            </q-menu>
          </q-item>

          <q-item :active="route.name === 'sprints'" clickable v-ripple>
            <q-item-section avatar>
              <SprintIcon />
            </q-item-section>

            <q-item-section> Спринты </q-item-section>

            <q-item-section side>
              <q-icon name="expand_more" size="16px" />
            </q-item-section>

            <q-menu anchor="top end" self="top start" :offset="[8, 0]" max-height="70vh">
              <NavPopupSprints />
            </q-menu>
          </q-item>

          <q-item :active="route.path.includes('/forms')" clickable v-ripple>
            <q-item-section avatar>
              <MenuFormsIcon :is-dark="$q.dark.isActive" />
            </q-item-section>

            <q-item-section> Формы </q-item-section>

            <q-item-section side>
              <q-icon name="expand_more" size="16px" />
            </q-item-section>

            <q-menu anchor="top end" self="top start" :offset="[8, 0]" max-height="70vh">
              <NavPopupForms />
            </q-menu>
          </q-item>

          <q-item
            :active="route.path.includes('/aidoc')"
            clickable
            v-ripple
            @click="router.push(`/${currentWorkspaceSlug}/aidoc`)"
          >
            <q-item-section avatar>
              <AIDocIcon />
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
        class="drawer-btn"
        :icon="miniState ? 'chevron_right' : 'chevron_left'"
        @click="drawerClick"
      />
    </div>

    <AiplanHelpDialog v-model="isHelpOpen" />
    <FeedbackDialog
      v-model="isFeedbackOpen"
      @success="(msg) => onSuccess(msg)"
    />
    <ReleaseNotePreviewDialog v-model="isReleaseOpen" />
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

// services
import { useNotificationStore } from 'src/stores/notification-store';
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

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

import { useWorkspaceStore } from 'src/stores/workspace-store';

const $q = useQuasar();
const miniState = ref(false);
const drawer = ref(true);
const router = useRouter();
const route = useRoute();

const { setNotificationView } = useNotificationStore();

const isHelpOpen = ref(false);
const isFeedbackOpen = ref(false);
const isReleaseOpen = ref(false);

const drawerClick = () => (miniState.value = !miniState.value);

const onSuccess = (msg?: string) => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
};

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

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
