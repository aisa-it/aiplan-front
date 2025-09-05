<template>
  <span
    class="user-link"
    @mouseover="openMenu"
    @mouseleave="delayedCloseMenu"
    @click="handleClickBtn"
  >
    <UserInfoPopup
      v-if="member && isShowMenu"
      ref="userPopup"
      :member="member"
      :tooltip="aiplan.UserName(member).join(' ')"
      :text="
        [
          aiplan.UserName(member)[0]?.at(0).toUpperCase(),
          aiplan.UserName(member)[1]?.at(0).toUpperCase(),
        ].join(' ')
      "
      :image="member?.avatar_id"
      @mouseenter="cancelDelayedClose"
      @mouseleave="closeMenu"
    />
    {{ aiplan.UserName(member).join(' ') }}
  </span>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import UserInfoPopup from 'src/components/UserInfoPopup.vue';
import aiplan from 'src/utils/aiplan';

const props = defineProps<{
  member?: object;
}>();

const userPopup = ref();
const closeTimer = ref();
const isShowMenu = ref(false);

const cancelDelayedClose = () => {
  isShowMenu.value = true;
  clearTimeout(closeTimer.value);
};

const closeMenu = () => {
  if (!props.member) return;
  isShowMenu.value = false;
};

const delayedCloseMenu = () => {
  if (!props.member) return;
  closeTimer.value = setTimeout(() => {
    closeMenu();
  }, 200);
};

const openMenu = () => {
  if (!props.member) return;
  isShowMenu.value = true;
  nextTick(() => userPopup.value?.showMenu());
};

const handleClickBtn = () => {
  if (isShowMenu.value) {
    isShowMenu.value = false;
    return;
  }
  openMenu();
};
</script>

<style lang="scss" scoped>
.user-link {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
