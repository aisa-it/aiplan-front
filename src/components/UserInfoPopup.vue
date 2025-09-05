<template>
  <q-menu
    ref="userMenu"
    fit
    transition-show="scale"
    transition-hide="scale"
    :self="isShowPopupMiddle ? 'top middle' : undefined"
    :anchor="isShowPopupMiddle ? 'bottom middle' : undefined"
  >
    <div class="avatar-popup">
      <q-avatar
        v-if="showAvatarPopup"
        :size="'38px'"
        :class="{
          avatar: true,
          'none-avatar': !image,
          square: true,
        }"
      >
        <q-img
          v-if="image"
          :src="getUrlFile(image)"
          spinner-size="38px"
          :style="'object-fit: cover; width: 100%; height: 100%; background-color: white;'"
        >
          <template v-slot:error>
            <div class="none-avatar text-avatar">
              {{ error || text }}
            </div>
          </template>
        </q-img>
        <div v-else class="text-avatar">
          {{ text }}
        </div>
      </q-avatar>
      <div
        class="column word-wrap"
        :style="showAvatarPopup ? 'width: 90%' : 'width: 100%'"
      >
        <div class="flex items-center">
          <span
            class="body-1-medium word-wrap"
            :class="{ 'text-center': isPopupTextCenter }"
          >
            {{ tooltip }}
          </span>

          <div
            v-if="tooltip"
            style="position: relative; width: 24px; height: 24px"
          >
            <component
              v-if="member?.status"
              :is="UserStatus"
              v-bind="userStatusProps"
            />
          </div>
        </div>
        <div class="flex items-center">
          <span class="body-2" :class="{ 'text-center': isPopupTextCenter }"
            >@{{ member?.username || '' }}</span
          >
          <div
            v-if="!tooltip"
            style="position: relative; width: 24px; height: 24px"
          >
            <component
              v-if="member?.status"
              :is="UserStatus"
              v-bind="userStatusProps"
            />
          </div>
        </div>

        <span
          class="body-2 full-w"
          :class="{ 'text-center': isPopupTextCenter }"
          >{{ member?.email }}</span
        >

        <span
          class="body-2 full-w"
          :class="{ 'text-center': isPopupTextCenter }"
          >{{ formatTime(new Date(), member?.user_timezone) }}
          {{ getCityFromTimezone(member?.user_timezone) }}</span
        >
      </div>
    </div>
  </q-menu>
</template>

<script setup lang="ts">
//core
import { ref } from 'vue';
//utils
import { getUrlFile } from 'src/utils/helpers';
import { formatTime, getCityFromTimezone } from 'src/utils/time';
//components
import UserStatus from './selects/components/UserStatus.vue';

const props = withDefaults(
  defineProps<{
    member?: object;
    isShowPopupMiddle: boolean;
    isPopupTextCenter: boolean;
    showAvatarPopup: boolean;
    tooltip?: string;
    image?: string;
    text?: string;
    error?: string;
  }>(),
  {
    isShowPopupMiddle: false,
    isPopupTextCenter: false,
    showAvatarPopup: true,
  },
);

//state
const userMenu = ref();
const userStatusProps = ref({
  class: 'q-ml-sm',
  style: 'position: absolute',
  status: props.member?.status,
  'status-emoji': props.member?.status_emoji,
  'status-end-time': props.member?.status_end_date,
  icon: true,
});

//methods
const showMenu = () => {
  userMenu.value?.show();
};

//expose
defineExpose({
  showMenu,
});
</script>

<style lang="sass" scoped>
@use "sass:map"
.avatar
  color: white

.square
  border-radius: 8px

.border
  outline: 2px solid $grey-5

.avatar-error
  top: 0
  left: 0
  right: 0
  bottom: 0
  position: absolute
  display: flex
  align-items: center
  justify-content: center
  padding: 3px 0 0 0
  background-color: $grey-5
  color: red
  font-size: map.get($body2,'size')
</style>

<style lang="scss" scoped>
.q-tooltip {
  background-color: blue !important;
}

.avatar-popup {
  padding: 10px;
  max-width: 340px;
  max-height: 240px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
</style>
