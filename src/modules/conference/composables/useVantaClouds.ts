import { onUnmounted, ref } from 'vue';
import { useDisplay } from 'vuetify';

// utils
import { CLOUD_THEMES } from '../constants/themes';
import { defineBackgroundImage } from '../utils/defineBackgroundImage';
import { getCurrentTimeOfDay } from '../utils/timeOfDay';

export interface VantaEffect {
  destroy(): void;
}

export type VantaCloudsFactory = (
  options: Record<string, unknown>,
) => VantaEffect;

declare global {
  interface Window {
    THREE?: typeof import('three');
    VANTA?: {
      CLOUDS?: VantaCloudsFactory;
      clouds?: VantaCloudsFactory;
    };
  }
}

const BG_ELEMENT_ID = 'vanta-clouds-bg';

const REVEAL_DELAY_MS = 700;

/**
 * Фон страницы входа в конференцию.
 *
 * Анимированные облака (three.js + vanta), если браузер потянет WebGPU/WebGL
 * и пользователь их не выключал; иначе — статичная картинка по времени суток.
 * На мобильных облака не включаются. three и vanta грузятся лениво, отдельным
 * чанком — в основной бандл не попадают. Выбор пользователя хранится
 * в localStorage (`clouds-enable`).
 *
 * - `init()` — вызвать один раз в onMounted; когда попытка завершится
 *   (успехом или фолбэком на статичный фон), гасит `loading` с небольшой
 *   паузой, чтобы карточка не появлялась раньше фона;
 * - `toggleClouds()` — включить/выключить облака (кнопка в углу страницы);
 * - рисует в элемент `#vanta-clouds-bg` из шаблона ConferenceEntry,
 *   туда же ставится статичный фон;
 * - эффект vanta освобождается при размонтировании компонента.
 */
export function useVantaClouds() {
  const { mobile } = useDisplay();

  const loading = ref(true);
  const isEnableClouds = ref(true);
  const isEnableGPU = ref(false);

  let vantaEffect: VantaEffect | null = null;

  async function init() {
    try {
      if (!mobile.value && localStorage.getItem('clouds-enable') !== '0') {
        await createClouds();
      } else {
        isEnableClouds.value = false;
        setStaticBg();
      }
    } catch {
      isEnableClouds.value = false;
      setStaticBg();
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, REVEAL_DELAY_MS);
    }
  }

  async function createClouds() {
    try {
      const adapter = await navigator.gpu?.requestAdapter().catch(() => null);
      isEnableGPU.value = !!adapter || isWebGLSupported();

      const THREE = await import('three');
      window.THREE = THREE;

      const CLOUDS = await import('vanta/dist/vanta.clouds.min');

      if (isEnableGPU.value) {
        const theme = CLOUD_THEMES[getCurrentTimeOfDay()];

        const factory =
          typeof CLOUDS.default === 'function'
            ? CLOUDS.default
            : (window.VANTA?.CLOUDS ?? window.VANTA?.clouds);

        if (!factory) {
          setStaticBg();
          return;
        }

        vantaEffect = factory({
          ...theme,
          THREE: window.THREE,
        });
      } else {
        setStaticBg();
      }
    } catch (err) {
      console.error('[useVantaClouds] Failed to init Vanta clouds:', err);
      setStaticBg();
    }
  }

  function toggleClouds() {
    try {
      isEnableClouds.value = !isEnableClouds.value;

      localStorage.setItem('clouds-enable', isEnableClouds.value ? '1' : '0');

      if (isEnableClouds.value === true) {
        createClouds();
      } else if (vantaEffect) {
        vantaEffect.destroy();
        vantaEffect = null;
        setStaticBg();
      }
    } catch {
      setStaticBg();
      isEnableClouds.value = false;
    }
  }

  function isWebGLSupported() {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(gl && gl instanceof WebGLRenderingContext);
  }

  function setStaticBg() {
    const block = document.getElementById(BG_ELEMENT_ID);
    if (block) {
      block.style.backgroundImage = `url(${defineBackgroundImage(getCurrentTimeOfDay())})`;
      block.style.backgroundSize = 'cover';
      block.style.backgroundRepeat = 'no-repeat';
      block.style.backgroundPosition = 'center';
    }
  }

  onUnmounted(() => {
    vantaEffect?.destroy();
    vantaEffect = null;
  });

  return { loading, isEnableClouds, init, toggleClouds };
}
