<template>
  <div class="conference-text-field">
    <span :class="isNight ? 'conference-night-text' : 'conference-text'"
      >Добро пожаловать,
    </span>
    <div
      class="user-card"
      :class="isNight ? 'user-card-dark-bg' : 'user-card-bg'"
    >
      <AvatarImage
        :key="user?.id"
        :tooltip="aiplan.UserName(user).join(' ')"
        :text="
          [
            aiplan.UserName(user)[0]?.at(0),
            aiplan.UserName(user)[1]?.at(0),
          ].join(' ')
        "
        :image="user.avatar_id"
        :member="user"
        disable-popup
      ></AvatarImage>
      <span :class="isNight ? 'conference-night-text ' : 'conference-text'">
        {{ aiplan.UserName(user).join(' ') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import AvatarImage from 'src/components/AvatarImage.vue';

// stores
import { useUserStore } from 'src/stores/user-store';

// utils
import aiplan from 'src/utils/aiplan';

const { user } = storeToRefs(useUserStore());

defineProps<{
  isNight: boolean;
}>();
</script>

<style scoped lang="scss">
.conference-text-field {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 12px;
  align-items: center;

  @media screen and (max-width: 480px) {
    flex-direction: column;
  }

  span {
    font-weight: 400;
    font-style: Regular;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.5px;
    text-align: center;
    vertical-align: middle;
  }
}

.user-card-bg {
  background: #ffffff7a;
}
.user-card-dark-bg {
  background: #383838;
  border: 1px solid #5e5e5e;
}

.user-card {
  border-radius: 100px;
  width: fit-content;
  padding: 8px 16px 8px 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-family: Rubik;
    font-weight: 600;
    font-style: SemiBold;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.5px;
  }
}

.conference-text {
  color: #474a52;
}
.conference-night-text {
  color: #bac4d5;
}
</style>
