<template>
  <div class="audio-player">
    <audio
      v-if="src"
      ref="audioRef"
      :src="src"
      preload="metadata"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @progress="syncBuffered"
      @play="onPlay"
      @pause="isPlaying = false"
      @ended="onEnded"
      @waiting="isBuffering = true"
      @canplay="isBuffering = false"
      @playing="isBuffering = false"
      @error="onError"
    ></audio>

    <div v-if="title" class="audio-player__title ellipsis">
      {{ title }}
      <HintTooltip>{{ title }}</HintTooltip>
    </div>

    <div v-if="hasError" class="audio-player__error column items-center">
      <q-icon name="music_off" size="32px" />
      <span class="audio-player__error-text">{{ errorText }}</span>
      <q-btn
        flat
        no-caps
        class="secondary-btn q-mt-sm"
        label="Скачать файл"
        @click="emits('download')"
      />
    </div>

    <template v-else>
      <div
        ref="trackRef"
        class="audio-player__track"
        role="slider"
        tabindex="0"
        aria-label="Позиция воспроизведения"
        :aria-valuemin="0"
        :aria-valuemax="Math.round(seekableDuration)"
        :aria-valuenow="Math.round(displayTime)"
        :aria-valuetext="`${formatTime(displayTime)} из ${formatTime(seekableDuration)}`"
        @pointerdown="onTrackPointerDown"
        @keydown="onTrackKeydown"
      >
        <div class="audio-player__track-line">
          <div
            class="audio-player__buffered"
            :style="{ width: `${bufferedPercent}%` }"
          ></div>
          <div
            class="audio-player__played"
            :style="{ width: `${playedPercent}%` }"
          ></div>
        </div>
        <div
          class="audio-player__thumb"
          :style="{ left: `${playedPercent}%` }"
        ></div>
      </div>

      <div class="audio-player__times">
        <span>{{ formatTime(displayTime) }}</span>
        <span>{{ formatTime(seekableDuration) }}</span>
      </div>

      <div class="audio-player__controls row items-center no-wrap">
        <q-btn
          flat
          dense
          round
          :disable="!isSeekable"
          @click="skip(-SKIP_SECONDS)"
        >
          <q-icon name="replay_10" size="22px" />
          <HintTooltip>Назад на {{ SKIP_SECONDS }} секунд</HintTooltip>
        </q-btn>

        <q-btn
          flat
          dense
          round
          class="audio-player__play"
          :disable="!src"
          @click="togglePlay"
        >
          <DefaultLoader v-if="isBuffering && isPlaying" :size="26" />
          <q-icon
            v-else
            :name="isPlaying ? 'pause' : 'play_arrow'"
            size="30px"
          />
          <HintTooltip>{{ isPlaying ? 'Пауза' : 'Воспроизвести' }}</HintTooltip>
        </q-btn>

        <q-btn
          flat
          dense
          round
          :disable="!isSeekable"
          @click="skip(SKIP_SECONDS)"
        >
          <q-icon name="forward_10" size="22px" />
          <HintTooltip>Вперёд на {{ SKIP_SECONDS }} секунд</HintTooltip>
        </q-btn>

        <q-space />

        <q-btn
          flat
          dense
          no-caps
          class="audio-player__rate"
          :label="`${rate}x`"
        >
          <HintTooltip>Скорость воспроизведения</HintTooltip>
          <q-menu auto-close>
            <q-list dense>
              <q-item
                v-for="value in RATES"
                :key="value"
                clickable
                v-close-popup
                :active="value === rate"
                @click="setRate(value)"
              >
                <q-item-section>{{ value }}x</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <div class="audio-player__volume row items-center no-wrap">
          <q-btn flat dense round @click="toggleMute">
            <q-icon :name="volumeIcon" size="22px" />
            <HintTooltip>{{
              isMuted ? 'Включить звук' : 'Выключить звук'
            }}</HintTooltip>
          </q-btn>
          <q-slider
            class="audio-player__volume-slider"
            :model-value="isMuted ? 0 : volume"
            :min="0"
            :max="1"
            :step="0.01"
            dense
            color="primary"
            aria-label="Громкость"
            @update:model-value="setVolume"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
//core
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

//components
import HintTooltip from 'src/components/HintTooltip.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';

//constants
const SKIP_SECONDS = 10;
const ARROW_SKIP_SECONDS = 5;
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const VOLUME_KEY = 'audio-player-volume';
const MUTED_KEY = 'audio-player-muted';

// Все смонтированные плееры страницы: звучать одновременно должен только один,
// иначе несколько вложений в задаче играют вперемешку.
const players = new Set<HTMLAudioElement>();

const props = withDefaults(
  defineProps<{
    src: string;
    title?: string;
    autoplay?: boolean;
  }>(),
  {
    title: '',
    autoplay: false,
  },
);

const emits = defineEmits<{
  (e: 'download'): void;
}>();

//variables
const audioRef = ref<HTMLAudioElement>();
const trackRef = ref<HTMLElement>();

const isPlaying = ref(false);
const isBuffering = ref(false);
const isSeeking = ref(false);
const errorCode = ref(0);

const duration = ref(0);
const currentTime = ref(0);
const bufferedEnd = ref(0);
const seekTime = ref(0);

const rate = ref(1);
const volume = ref(readStoredNumber(VOLUME_KEY, 1));
const isMuted = ref(readStoredFlag(MUTED_KEY));

//helpers
function readStoredNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : fallback;
  } catch {
    // приватный режим браузера может запрещать доступ к localStorage
    return fallback;
  }
}

function readStoredFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

const persistVolume = () => {
  try {
    localStorage.setItem(VOLUME_KEY, String(volume.value));
    localStorage.setItem(MUTED_KEY, isMuted.value ? '1' : '0');
  } catch {
    // громкость не переживёт перезагрузку — не повод ронять плеер
  }
};

const formatTime = (value: number): string => {
  if (!Number.isFinite(value) || value < 0) return '--:--';

  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (part: number) => String(part).padStart(2, '0');

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

//computeds
const hasError = computed(() => errorCode.value > 0);

// У VBR-mp3 без корректных заголовков duration приходит Infinity, пока файл
// не докачан целиком — перематывать в этом случае некуда.
const seekableDuration = computed(() =>
  Number.isFinite(duration.value) ? duration.value : 0,
);
const isSeekable = computed(
  () => !hasError.value && seekableDuration.value > 0,
);
const displayTime = computed(() =>
  isSeeking.value ? seekTime.value : currentTime.value,
);

const toPercent = (value: number): number =>
  seekableDuration.value > 0
    ? Math.min(100, (value / seekableDuration.value) * 100)
    : 0;

const playedPercent = computed(() => toPercent(displayTime.value));
const bufferedPercent = computed(() => toPercent(bufferedEnd.value));

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'volume_off';
  return volume.value < 0.5 ? 'volume_down' : 'volume_up';
});

const errorText = computed(() => {
  // Коды из HTMLMediaElement.error: 2 — сеть, 3 — не удалось декодировать,
  // 4 — браузер не знает такой контейнер/кодек (ape, wma, aiff вне Safari).
  switch (errorCode.value) {
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Не удалось загрузить файл: проблема с сетью.';
    case MediaError.MEDIA_ERR_DECODE:
      return 'Не удалось воспроизвести файл: он повреждён.';
    default:
      return 'Браузер не умеет проигрывать этот формат. Файл можно скачать и открыть локально.';
  }
});

//methods
const applyAudioSettings = () => {
  const audio = audioRef.value;
  if (!audio) return;

  audio.volume = volume.value;
  audio.muted = isMuted.value;
  audio.playbackRate = rate.value;
};

const syncBuffered = () => {
  const audio = audioRef.value;
  if (!audio) return;

  const ranges = audio.buffered;
  let end = 0;
  for (let i = 0; i < ranges.length; i++) {
    if (
      ranges.start(i) <= audio.currentTime &&
      audio.currentTime <= ranges.end(i)
    ) {
      end = ranges.end(i);
      break;
    }
  }
  bufferedEnd.value = end;
};

const onLoadedMetadata = () => {
  errorCode.value = 0;
  duration.value = audioRef.value?.duration ?? 0;
  applyAudioSettings();
};

const onTimeUpdate = () => {
  if (isSeeking.value) return;
  currentTime.value = audioRef.value?.currentTime ?? 0;
  syncBuffered();
};

const onPlay = () => {
  isPlaying.value = true;

  const audio = audioRef.value;
  // При пустом src <audio> не отрисован, и onMounted зарегистрировать его не мог.
  if (audio) players.add(audio);

  players.forEach((player) => {
    if (player !== audio && !player.paused) player.pause();
  });
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = seekableDuration.value;
};

const onError = () => {
  errorCode.value =
    audioRef.value?.error?.code ?? MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
  isPlaying.value = false;
  isBuffering.value = false;
};

const togglePlay = async () => {
  const audio = audioRef.value;
  if (!audio) return;

  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      // play() отклоняется политикой автозапуска или битым источником —
      // состояние вернут события pause/error, отдельно реагировать не на что
    }
  } else {
    audio.pause();
  }
};

const seekTo = (value: number) => {
  const audio = audioRef.value;
  if (!audio || !isSeekable.value) return;

  const time = Math.min(Math.max(value, 0), seekableDuration.value);
  audio.currentTime = time;
  currentTime.value = time;
};

const skip = (offset: number) => {
  const audio = audioRef.value;
  if (!audio) return;
  seekTo(audio.currentTime + offset);
};

const timeFromEvent = (event: PointerEvent): number => {
  const rect = trackRef.value?.getBoundingClientRect();
  if (!rect?.width) return 0;

  const ratio = Math.min(
    Math.max((event.clientX - rect.left) / rect.width, 0),
    1,
  );
  return ratio * seekableDuration.value;
};

const onTrackPointerMove = (event: PointerEvent) => {
  seekTime.value = timeFromEvent(event);
};

// Слушатели вешаем на window, а не на саму дорожку: иначе перемотка обрывается,
// как только курсор во время drag'а уходит за пределы полосы.
const stopSeeking = () => {
  window.removeEventListener('pointermove', onTrackPointerMove);
  window.removeEventListener('pointerup', onTrackPointerUp);
  window.removeEventListener('pointercancel', stopSeeking);
  isSeeking.value = false;
};

function onTrackPointerUp(event: PointerEvent) {
  const time = timeFromEvent(event);
  stopSeeking();
  seekTo(time);
}

const onTrackPointerDown = (event: PointerEvent) => {
  if (!isSeekable.value) return;

  event.preventDefault();
  trackRef.value?.focus();
  isSeeking.value = true;
  seekTime.value = timeFromEvent(event);

  window.addEventListener('pointermove', onTrackPointerMove);
  window.addEventListener('pointerup', onTrackPointerUp);
  window.addEventListener('pointercancel', stopSeeking);
};

const onTrackKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      skip(-ARROW_SKIP_SECONDS);
      break;
    case 'ArrowRight':
      skip(ARROW_SKIP_SECONDS);
      break;
    case 'Home':
      seekTo(0);
      break;
    case 'End':
      seekTo(seekableDuration.value);
      break;
    case ' ':
    case 'Enter':
      void togglePlay();
      break;
    default:
      return;
  }
  event.preventDefault();
};

const setVolume = (value: number | null) => {
  const next = Math.min(Math.max(value ?? 0, 0), 1);
  volume.value = next;
  isMuted.value = next === 0;
  applyAudioSettings();
  persistVolume();
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (!isMuted.value && volume.value === 0) volume.value = 1;
  applyAudioSettings();
  persistVolume();
};

const setRate = (value: number) => {
  rate.value = value;
  applyAudioSettings();
};

//hooks
onMounted(() => {
  const audio = audioRef.value;
  if (!audio) return;

  players.add(audio);
  applyAudioSettings();
  if (props.autoplay) void togglePlay();
});

onBeforeUnmount(() => {
  stopSeeking();

  const audio = audioRef.value;
  if (!audio) return;

  players.delete(audio);
  audio.pause();
  // Без сброса источника браузер продолжает тянуть файл после закрытия диалога.
  audio.removeAttribute('src');
  audio.load();
});

watch(
  () => props.src,
  () => {
    stopSeeking();
    errorCode.value = 0;
    duration.value = 0;
    currentTime.value = 0;
    bufferedEnd.value = 0;
    seekTime.value = 0;
    isPlaying.value = false;
    isBuffering.value = false;
  },
);
</script>

<style lang="scss" scoped>
.audio-player {
  width: 100%;
  color: var(--text-color);

  &__title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    text-align: center;
  }

  &__track {
    position: relative;
    height: 18px;
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
    outline: none;

    &:focus-visible .audio-player__track-line {
      box-shadow: 0 0 0 2px var(--primary-light);
    }

    &:hover .audio-player__thumb,
    &:focus-visible .audio-player__thumb {
      opacity: 1;
    }
  }

  &__track-line {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: var(--progress-bg-base);
  }

  &__buffered,
  &__played {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }

  &__buffered {
    background-color: var(--border-color);
    opacity: 0.6;
  }

  &__played {
    background-color: var(--primary);
  }

  &__thumb {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--primary);
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }

  &__times {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--sub-text-color);
    font-variant-numeric: tabular-nums;
  }

  &__controls {
    margin-top: 4px;
    gap: 2px;
  }

  &__play {
    color: var(--primary);
  }

  &__rate {
    min-width: 44px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  &__volume-slider {
    width: 80px;
    margin-left: 4px;
  }

  &__error {
    padding: 16px 8px;
    text-align: center;
    color: var(--sub-text-color);
  }

  &__error-text {
    margin-top: 8px;
    font-size: 13px;
    max-width: 320px;
  }
}

@media screen and (max-width: 600px) {
  .audio-player__volume-slider {
    display: none;
  }
}
</style>
