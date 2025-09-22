<template>
  <q-btn
    :size="btnsize || '16px'"
    :round="rounded"
    :flat="!rounded"
    unelevated
    dense
    @mouseover="openMenu"
    @mouseenter="cancelCloseMenu"
    @mouseleave="closeMenu"
    @click="handleClickBtn"
  >
    <UserInfoPopup
      v-if="member && isShowMenu && !disablePopup"
      :isPopupTextCenter="isPopupTextCenter"
      :isShowPopupMiddle="isShowPopupMiddle"
      :showAvatarPopup="showAvatarPopup"
      :member="member"
      :tooltip="tooltip"
      :text="text"
      :error="error"
      :image="image"
      ref="userPopup"
      @mouseenter="cancelCloseMenu"
      @mouseleave="closeMenu"
    />

    <q-avatar
      :size="size || '32px'"
      :class="[
        'avatar',
        {
          'none-avatar': !image,
          avatar_rounded: rounded,
        },
      ]"
    >
      <q-img
        v-if="image"
        :src="getUrlFile(image)"
        :spinner-size="size || '32px'"
        class="avatar__img"
      >
        <template v-slot:error>
          <div
            :class="[
              `none-avatar text-avatar avatar__error`,
              {
                avatar_resized: btnsize === '10px',
              },
            ]"
          >
            {{ error || text }}
          </div>
        </template>
      </q-img>

      <div
        v-else
        :class="[
          `text-avatar`,
          {
            avatar_resized: btnsize === '10px',
          },
        ]"
      >
        {{ text }}
      </div>
      <HatXmasIcon
        v-if="ny && !noHat"
        :class="`hat-overlay ${
          userStore.getTheme === 'light' ? 'hat-overlay_shadowed' : ''
        }`"
        :width="proportionHat"
        :height="proportionHat"
      />

      <q-badge v-if="icon" class="avatar__badge" floating color="teal">
        <q-icon dense size="16px" :name="icon" color="white" />
      </q-badge>
    </q-avatar>
  </q-btn>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user-store';

import UserInfoPopup from 'src/components/UserInfoPopup.vue';
import HatXmasIcon from './icons/HatXmasIcon.vue';

import { getUrlFile } from 'src/utils/helpers';
import { useAvatarImage } from 'src/composables/useAvatarImage';

interface IAvatarImageProps {
  text: string;
  prefix?: string;
  tooltip?: string;
  error?: string;
  icon?: string;
  image?: string;
  rounded?: boolean;
  border?: boolean;
  size?: string;
  btnsize?: string;
  member?: Record<string, any>;
  noHat?: boolean;
  showAvatarPopup?: boolean;
  isPopupTextCenter?: boolean;
  isShowPopupMiddle?: boolean;
  disablePopup?: boolean;
}

const props = withDefaults(defineProps<IAvatarImageProps>(), {
  rounded: true,
  border: false,
  noHat: false,
  showAvatarPopup: true,
  isPopupTextCenter: false,
  isShowPopupMiddle: false,
  disablePopup: false,
});

const {
  userPopup,
  isShowMenu,
  openMenu,
  cancelCloseMenu,
  closeMenu,
  handleClickBtn,
  ny,
  proportionHat,
} = useAvatarImage(props);

const userStore = useUserStore();
</script>

<style lang="scss" scoped>
@use 'sass:map';

.q-tooltip {
  background-color: blue !important;
}

.q-btn {
  :deep(.q-focus-helper) {
    display: none;
  }
}

.avatar {
  position: relative;
  color: white;
  border-radius: 8px;

  &_rounded {
    border-radius: 50%;
  }

  &_resized {
    font-size: 12px;
  }

  &__error {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 0 0 0;
    background-color: $grey-5;
    color: red;
    font-size: map.get($body2, 'size');
  }

  &__img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    background-color: white;
  }

  &__badge {
    padding: 1px;
  }
}

.hat-overlay {
  position: absolute;
  top: -55%;
  left: 35%;
  transform: translate(-50%, -50%) scale(0.7);
  width: 100%;
  height: auto;
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10;

  &_shadowed {
    filter: drop-shadow(-3px -1px 4px rgba(0, 0, 0, 0.7));
  }
}
</style>
