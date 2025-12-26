<template>
  <li class="q-my-sm">
    <div class="relative q-pb-xs">
      <div class="activity-string">
        <div>
          <div class="relative q-px-sm">
            <div class="q-mt-sm">
              <div class="ring">
                <AvatarImage
                  style="padding: 0 !important; border-radius: 30px !important"
                  :border="false"
                  :member="activity.actor_detail"
                  :text="
                    [
                      aiplan.UserName(activity.actor_detail)[0]?.at(0),
                      aiplan.UserName(activity.actor_detail)[1]?.at(0),
                    ].join(' ')
                  "
                  :image="activity.actor_detail.avatar_id"
                  size="32px"
                  @click="
                    activity.actor_detail.id === user.id
                      ? undefined
                      : navigateToActivityPage(activity.actor_detail.id)
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <div :style="'flex: 1 1 0%; margin-top: 8px '">
          <div class="pre-wrap">
            <span style="font-weight: 600">
              {{ activity.actor_detail.last_name }}
              {{
                activity.actor_detail.is_bot
                  ? ' Бот '
                  : ' ' + activity.actor_detail.first_name + ' '
              }}
            </span>

            <span v-html="activityComponents"></span>
            <br />
            <span
              :style="'white-space: nowrap; font-size: 0.75rem; line-height: 1rem;'"
              >{{ ' ' }}
              {{
                formatDate(new Date()) === formatDate(activity.created_at)
                  ? timeAgo(activity.created_at).toLowerCase()
                  : formatDateTime(activity.created_at)
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { timeAgo, formatDate, formatDateTime } from 'src/utils/time';

import { useUserStore } from 'src/stores/user-store';

import { activityRender } from './renders';
import AvatarImage from '../AvatarImage.vue';
import aiplan from 'src/utils/aiplan';

import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

const props = defineProps<{ activityRow: any; onlyProject?: boolean; onlyWorkspace?: boolean }>();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const activity = ref(props.activityRow);
const activityComponents = ref(transform());

const { navigateToActivityPage } = useUserActivityNavigation();

function transform() {
  return activityRender(activity.value, props.onlyProject, props.onlyWorkspace);
}
watch(
  () => props.activityRow,
  () => {
    activity.value = props.activityRow;
    activityComponents.value = transform();
  },
);
</script>

<style lang="scss" scoped>
.activity-string {
  display: flex;
  position: relative;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  align-items: center;
}

.ring {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 9999px;
  --ring-color: #ffffff;
}

.empty-user-icon {
  display: grid;
  place-items: center;
  border-radius: 9999px;
  border-width: 2px;
  border-color: #ffffff;
  font-size: 0.75rem;
  line-height: 1rem;
  width: 32px;
  height: 32px;
  color: #ffffff;
  background-color: #374151;
}

ul,
li {
  list-style-type: none;
}

.pre-wrap {
  word-break: break-all;
}
</style>
