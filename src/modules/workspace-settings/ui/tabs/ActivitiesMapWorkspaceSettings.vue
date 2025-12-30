<template>
  <div
    class="main-container"
    v-if="
      Object.keys(WorkspaceActivityMap).length &&
      Object.keys(names).length &&
      !loadReq
    "
  >
    <div class="q-mt-md example-block">
      <div
        :class="['heatmap-square', `level-${index}`]"
        v-for="(text, index) in colorOfActivity"
        :key="index"
      >
        <q-popup-proxy
          v-if="level !== -1"
          transition-show="scale"
          transition-hide="scale"
          class="q-pa-sm"
        >
          <div>{{ text }}</div>
        </q-popup-proxy>
      </div>
    </div>
    <div
      :class="isMobile ? '' : 'item-container'"
      v-for="(space, name, index) in WorkspaceActivityMap"
      :key="index"
    >
      <div
        :class="isMobile ? 'avatar-container-mobile' : 'avatar-container'"
        style="margin-top: 20px"
      >
        <AvatarImage
          style="padding: 0 !important; border-radius: 30px !important"
          :border="false"
          :member="names[name]?.member"
          :text="names[name]?.symbols"
          :image="names[name]?.member.avatar_id"
          :size="isMobile ? '32px' : '60px'"
          @click.stop="navigateToActivityPage(name)"
        />
        <div
          :class="isMobile ? 'q-pa-sm' : 'q-pa-sm text-center column'"
          style="font-size: 16px; width: 100%; overflow: hidden"
        >
          <div class="abbriviated-text">
            {{ names[name]?.member.first_name }}
          </div>
          <div class="abbriviated-text">
            {{ ' ' + names[name]?.member.last_name }}
          </div>
        </div>
      </div>
      <ActivityHotMap
        :exampleBlock="false"
        :activities="space"
        class="activityhotmap q-ml-sm"
        style="overflow-x: auto"
      />
    </div>
  </div>
  <div
    v-if="loadReq"
    style="width: 100%; height: calc(100vh - 300px)"
    class="row justify-center items-center"
  >
    <q-spinner-oval color="primary" class="q-mt-sm" size="48px" />
  </div>
</template>

<script setup>
import { useMeta } from 'quasar';

import { storeToRefs } from 'pinia';
import ActivityHotMap from 'src/components/activity/ActivityHotMap.vue';
import AvatarImage from 'src/components/AvatarImage.vue';
import aiplan from 'src/utils/aiplan';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSettingsStore } from 'src/modules/workspace-settings/stores/settings-store';
import { useUserStore } from 'src/stores/user-store';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

const props = defineProps({
  currentWsInfo: { type: Object, required: true },
  currentWsSlug: { type: String, required: true },
});

const workspaceStore = useWorkspaceStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();
const { WorkspaceActivityMap } = storeToRefs(settingsStore);
const quasar = useQuasar();
const colorOfActivity = [
  '0 активностей',
  '1-10 активностей',
  '11-20 активностей',
  '21-30 активностей',
  '31+ активностей',
];
const avatars = ref([]);
const names = ref({});
const loadReq = ref(true);
const today = new Date();
const tomorrow = new Date().setDate(today.getDate() + 1);
const isMobile = computed(() => quasar.screen.width <= 650);

const computedWorkspaceInfo = computed(() => props.currentWsInfo);

const { navigateToActivityPage } = useUserActivityNavigation();

const handleMembers = (members) => {
  return aiplan
    .UserName(members)
    .map((m) => m[0])
    .join(' ');
};
const metadata = ref({
  title: 'Загрузка...',
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

function setAnotherTitle(title) {
  metadata.value.title = `Настройки ${title}`;
}

onMounted(async () => {
  setAnotherTitle(computedWorkspaceInfo.value?.name);
  try {
    avatars.value = await workspaceStore.getWorkspaceMembers(
      props.currentWsSlug,
    );
    let startDates = new Date(today)
      .toISOString()
      .split('T')[0]
      .split('-')
      .reverse();

    let endDates = new Date(tomorrow)
      .toISOString()
      .split('T')[0]
      .split('-')
      .reverse();

    let dates = {
      from: startDates[0] + startDates[1] + String(startDates[2] - 1),
      to: endDates[0] + endDates[1] + endDates[2],
    };
    await settingsStore.setActivityDateOnWorkspace(
      props.currentWsSlug,
      dates.from,
      dates.to,
    );

    const userIds = Object.keys(WorkspaceActivityMap.value) || [];
    let members = [];

    for (let id of userIds) {
      let member = avatars.value.result.find(
        (member) => member?.member_id === id,
      );
      if (member) members.push(member);
      else {
        const user = await userStore.getUserById(id);
        if (user) members.push({ member: user, member_id: id });
      }
    }
    avatars.value.result = members;

    for (let i = 0; i < avatars.value?.result?.length; i++) {
      const name = handleMembers(avatars.value?.result[i].member);
      names.value[avatars.value?.result[i].member_id] = {
        member: avatars.value?.result[i].member,
        symbols: name,
      };
    }
  } finally {
    loadReq.value = false;
  }
});
</script>

<style scoped lang="scss">
.item-container {
  display: flex;
  align-items: center;
  width: 100%;
}
.example-block {
  display: flex;
  padding: 5px;
}
.heatmap-square {
  width: 18px;
  height: 18px;
  margin-left: 3px;
}
.heatmap-square:hover {
  border: 2px solid gray;
}
.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: 200px;
  max-width: 200px;
}
.avatar-container-mobile {
  display: flex;
}
.name-container {
  width: 100%;
  text-align: start;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
