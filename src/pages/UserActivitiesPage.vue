<template>
  <div class="row column">
    <div class="col q-pa-md">
      <div v-if="!loadingInfo" style="display: flex; align-items: center">
        <AvatarImage
          noHat
          :member="userInfo"
          :text="handleMembers(userInfo)"
          :image="userInfo?.avatar_id || ''"
          :size="isMobile ? '60px' : '100px'"
          :class="
            ny
              ? 'profile-avatar flex-shrink-0 q-mt-md'
              : 'profile-avatar flex-shrink-0'
          "
        />
        <div class="q-ml-md">
          <div class="row gap-2">
            <div
              :style="{
                fontSize: isMobile ? '18px' : '30px',
                wordBreak: 'break-word',
              }"
              class="q-mr-xs"
            >
              {{ getFullName }}
            </div>
            <UserStatus
              style="width: fit-content"
              :status="userInfo?.status"
              :statusEmoji="userInfo?.status_emoji"
              :status-end-time="userInfo?.status_end_date"
            />
          </div>

          <div style="font-size: 18px; color: #8b8b98">
            @{{ userInfo?.username }}
          </div>

          <div style="font-size: 18px; color: #8b8b98">
            {{ userInfo?.email }}
          </div>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="q-pr-md q-pl-md">
        <ActivityHotMap
          v-if="Object.keys(userActivityMap).length"
          :activities="userActivityMap"
          :loadReq="loadReq"
          @on-cell-click="onUpdateActivity"
        />
        <div v-else>
          {{
            rows.length
              ? 'Недостаточно данных для отображения активности по дням'
              : 'У пользователя не было активности'
          }}
        </div>
      </div>
      <ActivitiesList
        :rows="rows"
        :current-day="currentDay"
        :rows-count="rowsCount"
        class="activity-list"
        @update="onRequest"
        @on-close-click="closeCurrentActivity"
      />
    </div>
  </div>
</template>

<script lang="ts">
// core
import { defineComponent, onMounted, toRef, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Screen } from 'quasar';

// store
import { useUserStore } from 'stores/user-store';

// utils
import AvatarImage from 'components/AvatarImage.vue';
import aiplan from 'src/utils/aiplan';
import { storeToRefs } from 'pinia';

// component
import ActivitiesList from 'components/activity/ActivitiesList.vue';
import ActivityHotMap from 'components/activity/ActivityHotMap.vue';
import { useUtilsStore } from 'stores/utils-store';
import UserStatus from 'src/components/selects/components/UserStatus.vue';
import { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export default defineComponent({
  name: 'UserActivitiesPage',
  components: { ActivityHotMap, AvatarImage, ActivitiesList, UserStatus },
  setup() {
    const route = useRoute();

    // stores
    const userStore = useUserStore();
    const { userActivityMap } = storeToRefs(userStore);
    const utilsStore = useUtilsStore();
    const { ny } = storeToRefs(utilsStore);

    //vars
    const userId = toRef(route.params.id);
    const userInfo = ref<DtoUser>({});
    const loadReq = ref(true);
    const loadingInfo = ref(true);
    const rows = ref([]);
    const rowsCount = ref(0);
    const pagination = {
      orderBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    };
    const currentDay = ref<string>('');

    const onUpdateActivity = async (day: string) => {
      currentDay.value = day;
      await onRequest({ pagination });
    };

    const isMobile = computed(() => Screen.width <= 650);

    const getFullName = computed(() =>
      userInfo.value
        ? `${userInfo.value.first_name} ${userInfo.value.last_name}`
        : '',
    );

    const closeCurrentActivity = async () => {
      currentDay.value = '';
      await onRequest({ pagination });
    };

    async function onRequest(p: any) {
      //TODO sortBy, descending не используются
      const { page, rowsPerPage, sortBy, descending, rowsNumber } =
        p.pagination;

      await userStore
        .getUserActivitiesByID(userId.value as string, {
          day:
            currentDay.value !== ''
              ? currentDay.value.split('.').join('')
              : undefined,
          offset: (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
          limit: rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
        })
        .then((res) => {
          rowsCount.value = res.count || 0;
          rows.value = res.result;
        });
    }

    const handleMembers = (members: any) => {
      return aiplan
        .UserName(members)
        .map((m) => m[0])
        .join(' ');
    };

    // onUnmounted(() => {
    //   userActivityMap.$destroy();
    // })

    onMounted(async () => {
      userInfo.value = await userStore
        .getUserById(userId.value as string)
        .finally(() => (loadingInfo.value = false));

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const dates = todayString.split('-').reverse();
      const from = `${dates[0]}${dates[1]}${String(
        Number(dates[2]) - 1,
      ).padStart(2, '0')}`;
      const to = `${dates[0]}${dates[1]}${dates[2]}`;
      await userStore
        .getUserActivityDateById(userId.value as string, { from: from, to: to })
        .finally(() => (loadReq.value = false));
    });

    return {
      userId,
      userInfo,
      avatarText: aiplan.UserName,
      loadReq,
      loadingInfo,
      rows,
      rowsCount,
      userActivityMap,
      currentDay,
      ny,
      getFullName,
      isMobile,
      onUpdateActivity,
      onRequest,
      closeCurrentActivity,
      handleMembers,
    };
  },
});
</script>

<style scoped lang="scss">
.profile-avatar :deep(.text-avatar) {
  font-size: 18px !important;
}

.activity-list :deep(.q-icon) {
  border: none;
  outline: none;
  box-shadow: none;
}

.activity-list :deep(.q-btn) {
  padding: 0;
}

.activity-list :deep(.q-btn::before) {
  content: none !important;
}
</style>
