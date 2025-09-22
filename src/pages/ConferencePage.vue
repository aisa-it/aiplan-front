<template>
  <div id="vanta-clouds-bg" class="vanta-container">
    <q-btn
      v-show="!loading"
      style="
        position: absolute;
        right: 0;
        top: 0;
        margin: 12px 12px 0px 0px;
        color: #fff;
      "
      icon="exit_to_app"
      class="delete-btn-only-icon-sm"
      @click="() => routeToWorkspace()"
    >
      <q-tooltip anchor="bottom left"> В АИПлан </q-tooltip>
    </q-btn>

    <div
      v-show="!loading"
      class="blur-wrapper"
      :class="isNight ? 'dark-blur-border' : 'blur-border'"
    >
      <div class="content">
        <div class="conference-text-field items-center wrap-row">
          <img src="~assets/logo.svg" style="width: 190px; overflow: visible" />
          <span
            class="conference-text-field__header"
            :class="isNight ? 'conference-night-text' : 'conference-text'"
            >Конференция</span
          >
        </div>

        <div class="conference-text-field items-center wrap-row2">
          <span
            class="conference-text-field__sub-text"
            :class="isNight ? 'conference-night-text' : 'conference-text'"
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
            <span
              :class="isNight ? 'conference-night-text ' : 'conference-text'"
              class="user-card__user-name"
            >
              {{ aiplan.UserName(user).join(' ') }}</span
            >
          </div>
        </div>

        <div
          class="conference-text-field items-start q-mt-sm"
          :class="$q.screen.width > 480 ? 'q-px-lg' : 'q-px-xs'"
        >
          <q-input
            v-model="roomName"
            ref="inputRef"
            dense
            outlined
            :rules="[(value) => value?.length || 'Введите название комнаты']"
            label="Имя комнаты"
            class="conference-input full-w"
            :class="isNight ? 'conference-input-dark' : 'conference-input'"
          />
          <q-btn class="primary-btn" no-caps @click="connectToConference()"
            ><span v-if="$q.screen.width > 480"> Начать встречу </span>
            <CheckIcon v-else
          /></q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import aiplan from 'src/utils/aiplan';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
import AvatarImage from 'src/components/AvatarImage.vue';
import {
  useGlobalLoading,
  stopGlobalLoading,
} from 'src/composables/useGlobalLoader';
import { useRouter } from 'vue-router';
import morning from 'assets/morning.png';
import afternoon from 'assets/afternoon.png';
import evening from 'assets/evening.png';
import night from 'assets/night.png';
import CheckIcon from 'src/components/icons/CheckIcon.vue';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const loading = ref(true);
const roomName = ref();
const isEnableGPU = ref(false);
const inputRef = ref();
const router = useRouter();

onBeforeMount(() => {
  useGlobalLoading();
});

onMounted(async () => {
  await userStore.getUserInfo();
  await navigator.gpu
    .requestAdapter()
    .then((data) => (isEnableGPU.value = Boolean(data)));

  if (isEnableGPU.value && window.VANTA) {
    window.VANTA.CLOUDS(themes[getCurrentTimeOfDay().timeOfDay]);
  } else {
    const block = document.getElementById('vanta-clouds-bg');
    block.style.backgroundImage = `url(${defineBackgroundImage()})`;
    block.style.backgroundSize = 'cover';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';
  }

  setTimeout(() => {
    stopGlobalLoading();
    loading.value = false;
  }, 700);
});

onUnmounted(() => (loading.value = true));

function getCurrentTimeOfDay() {
  const now = new Date();
  const hours = now.getHours();

  let timeOfDay;
  if (hours >= 5 && hours < 12) {
    timeOfDay = 'morning';
  } else if (hours >= 12 && hours < 17) {
    timeOfDay = 'afternoon';
  } else if (hours >= 17 && hours < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  return {
    time: now.toLocaleTimeString(),
    timeOfDay: timeOfDay,
  };
}

function defineBackgroundImage() {
  switch (getCurrentTimeOfDay().timeOfDay) {
    case 'morning':
      return morning;
    case 'afternoon':
      return afternoon;
    case 'evening':
      return evening;
    case 'night':
      return night;
  }
}

const isNight = computed(() => {
  return getCurrentTimeOfDay().timeOfDay === 'night';
});

const themes = {
  morning: {
    el: '#vanta-clouds-bg',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    backgroundColor: 0xffffff,
    skyColor: 0x68b8d7,
    cloudColor: 0xadc1de,
    cloudShadowColor: 0x183550,
    sunColor: 0xff9919,
    sunGlareColor: 0xff6633,
    sunlightColor: 0xff9933,
  },
  afternoon: {
    el: '#vanta-clouds-bg',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    backgroundColor: 0x0,
    skyColor: 0x1788e8,
    cloudColor: 0xafc7e5,
    cloudShadowColor: 0x182e3d,
    sunColor: 0xe9eab8,
    sunGlareColor: 0x744d2f,
    sunlightColor: 0x422d23,
  },
  evening: {
    el: '#vanta-clouds-bg',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    backgroundColor: 0x813e3e,
    skyColor: 0x9c8773,
    cloudColor: 0xd9bda2,
    cloudShadowColor: 0x20476a,
    sunColor: 0xe0d6bb,
    sunGlareColor: 0x47332a,
    sunlightColor: 0xa77a4c,
  },
  night: {
    el: '#vanta-clouds-bg',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    backgroundColor: 0x0,
    skyColor: 0x80e1f,
    cloudColor: 0x3c3e4f,
    cloudShadowColor: 0x82a4c,
    sunColor: 0xe9eab8,
    sunGlareColor: 0x2b1f12,
    sunlightColor: 0x512b1e,
  },
};

const connectToConference = () => {
  inputRef.value.validate();
  console.log(window.location);
  if (inputRef.value.hasError) return;

  // for local development
  if (window.location.hostname == 'localhost') {
    window.location = `${import.meta.env.VITE_API_URL}/api/auth/conf/${roomName.value}/`;
  } else {
    // production
    window.location = `${window.location.origin}/api/auth/conf/${roomName.value}/`;
  }
};

const routeToWorkspace = () => {
  router.push(`/${user.value.last_workspace_slug || '/'}`);
};
</script>
<style scoped lang="scss">
.vanta-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.blur-wrapper {
  max-width: 762px;
  width: 100%;
  max-height: 330px;
  border-radius: 16px;
  backdrop-filter: blur(48px);
  padding: 2em;
  background: transparent;
  @media screen and (max-width: 860px) {
    max-width: 640px;
  }
  @media screen and (max-width: 670px) {
    max-width: 440px;
    max-height: 330px;
  }

  @media screen and (max-width: 480px) {
    max-height: 360px;
    max-width: 310px;
  }
}

.blur-border {
  border: 1px solid #dbdbdb;
}
.dark-blur-border {
  border: 1px solid #5e5e5e;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media screen and (max-width: 670px) {
    gap: 12px;
  }
}

.conference-text-field {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 12px;

  &__header {
    font-weight: 500;
    font-style: Medium;
    font-size: 43px;
    line-height: 100%;
    letter-spacing: 0.25px;
    text-align: center;
    vertical-align: middle;
    @media screen and (max-width: 480px) {
      font-size: 34px;
    }
  }

  &__sub-text {
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

  &__user-name {
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
.wrap-row {
  @media screen and (max-width: 670px) {
    flex-direction: column;
  }
}

.wrap-row2 {
  @media screen and (max-width: 480px) {
    flex-direction: column;
  }
}
</style>
