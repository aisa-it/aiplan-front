<template>
  <div ref="panelWrapper" class="extended-search-wrapper" @click.capture="onWrapperClick">
    <q-img
      v-if="ny"
      fit="contain"
      :src="newYearTree"
      style="width: 38px; height: 32px;"
    />
    <template v-if="isMobile">
      <q-btn
        class="menu-link__btn"
        :flat="true"
        :dense="false"
        :icon="'more_horiz'"
        :style="
          'min-height: 18px !important; min-width: 18px; font-size: 12px; padding: 0; color: gray;'
        "
        @click.stop.prevent
      >
        <q-menu fit auto-close>
          <q-list>
            <q-item
              class="items-center"
              clickable
              @click="() => openConference()"
            >
              <q-btn
                v-if="isEnabledJitsi"
                flat
                dense
                class="q-mr-sm btn-only-icon-sm"
                data-tour="conference"
              >
                <ConferenceIcon />
                </q-btn
                >
                <span>Конференция</span>
            </q-item>
            <q-item
              class="items-center" clickable @click="() => openNotifications = true">
              <WorkspaceNotifications is-mobile />
              <span>Уведомления</span>
            </q-item>
            <q-item
              class="items-center" clickable @click="isSearchOpened = true">
              <SearchButton is-mobile />
              <span>Поиск</span>
            </q-item>
            <q-item v-if="!route.path.includes('admin-panel')"
              class="items-center" clickable @click="() => isCreateDialog = true" :disable="isCreateIssueDisabled" >
              <NewIssue is-mobile @set-disable="(value) => isCreateIssueDisabled = value"/>
              <span>Создать</span>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <WorkspaceNotifications is-dialog
      :show-dialog="openNotifications"
      @close-dialog="() => openNotifications = false"
      />
      <SearchByFiltersDialog v-model="isSearchOpened" />
      <NewIssue is-dialog :show-dialog="isCreateDialog" @close-dialog="closeDialog" />
    </template>

    <template v-else>
      <q-btn
        v-if="isEnabledJitsi"
        flat
        dense
        class="btn-only-icon-sm bordered"
        @click="() => openConference()"
        data-tour="conference"
      >
        <ConferenceIcon /><q-tooltip>Конференция</q-tooltip></q-btn
      >
      <WorkspaceNotifications />
      <SearchButton />
      <NewIssue v-if="!route.path.includes('admin-panel')" />
    </template>

    <ProfileButton data-id="profile-button-search-panel" data-tour="profile" />
  </div>
</template>

<script setup lang="ts">
// core
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

// components
import ProfileButton from 'src/components/ProfileButton.vue';
import NewIssue from 'src/components/NewIssue.vue';
import WorkspaceNotifications from 'src/modules/workspace-notifications/ui/WorkspaceNotifications.vue';
import SearchButton from 'src/components/search-panel/SearchButton.vue';
import ConferenceIcon from '../icons/ConferenceIcon.vue';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';
import SearchByFiltersDialog from 'src/modules/search-issues/ui/SearchByFiltersDialog.vue';

//icons
import newYearTree from 'src/assets/newYearTree.svg';

const route = useRoute();
const q = useQuasar();

const utilsStore = useUtilsStore();

//storesToRefs
const { isEnabledJitsi } = storeToRefs(utilsStore);
const { ny } = storeToRefs(utilsStore);

const isMobile = computed(() => q.platform.is.mobile);
const openNotifications = ref<boolean>(false);
const isSearchOpened = ref<boolean>(false);
const isCreateDialog = ref<boolean>(false);
const isCreateIssueDisabled = ref<boolean>(false);
const panelWrapper = ref(null);

const closeDialog = () => {
  isCreateDialog.value = false;
};

const onWrapperClick = (evt: MouseEvent) => {
  if (evt.target === panelWrapper.value) {
    evt.stopPropagation();
  }
}

function openConference() {
  window.open(`/conf/`);
}
</script>

<style scoped lang="scss">
.extended-search-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
}
</style>
