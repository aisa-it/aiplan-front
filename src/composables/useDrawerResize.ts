import { LocalStorage } from 'quasar';
import { computed, onMounted, onBeforeUnmount, ref, watch, Ref } from 'vue';

export function useDrawerResize(
  oppositeSideWidth: Ref<number>,
  defaultWidth: number,
  name: string,
) {
  let rafId: number | null = null;

  const clientWidth = ref(document.documentElement.clientWidth);
  const minWidth = computed(() =>
    Math.max(clientWidth.value / 2, defaultWidth),
  );
  const maxWidth = computed(() => clientWidth.value - oppositeSideWidth.value);
  const adaptiveWidth = computed(() =>
    Math.min(drawerWidth.value, maxWidth.value),
  );

  const drawerWidth = ref(Math.max(clientWidth.value / 2, defaultWidth));
  const targetWidth = ref(Math.max(clientWidth.value / 2, defaultWidth));
  const startX = ref(0);
  const startW = ref(0);
  const moving = ref(false);

  const clamp = (w: number) => {
    return Math.min(maxWidth.value, Math.max(minWidth.value, Math.round(w)));
  };

  const startRaf = () => {
    if (rafId != null) return;
    const tick = () => {
      const cur = drawerWidth.value;
      const tgt = targetWidth.value;
      const diff = tgt - cur;
      const step = diff * 0.22;

      if (Math.abs(diff) < 0.5) {
        drawerWidth.value = tgt;
        rafId = null;
        return;
      }

      drawerWidth.value = cur + step;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  };

  const stopRaf = () => {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const onPointerDown = (e: { clientX: number }) => {
    moving.value = true;
    startX.value = e.clientX;
    startW.value = drawerWidth.value;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  };

  const onPointerMove = (e: { clientX: number }) => {
    if (!moving.value) return;
    const dx = startX.value - e.clientX;
    targetWidth.value = clamp(startW.value + dx);
    startRaf();
  };

  const onPointerUp = () => {
    moving.value = false;
    window.removeEventListener('pointermove', onPointerMove);
    startRaf();
  };

  const updateClientWidth = () => {
    clientWidth.value = document.documentElement.clientWidth;
  };

  watch(drawerWidth, (val) => {
    LocalStorage.set(name, val);
  });

  onMounted(async () => {
    const saved = LocalStorage.getItem(name);
    if (saved) {
      drawerWidth.value = Math.max(Number(saved), minWidth.value);
      targetWidth.value = Math.max(Number(saved), minWidth.value);
    }

    window.addEventListener('resize', updateClientWidth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', updateClientWidth);
    stopRaf();
  });

  return {
    adaptiveWidth,
    onPointerDown,
    updateClientWidth,
  };
}
