import { ref } from 'vue';
import { api } from '../services/api';
import { useUserStore } from 'src/stores/user-store';
import type {
  AiplanIssueLockResponse,
  DtoUserLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let unlockTimer: number | null = null;

export function useLockIssueInfo(
  wsSlug: string,
  projectSlug: string,
  issueSlug: string,
) {
  const userStore = useUserStore();

  const isTryingToLock = ref(false);
  const lockedBy = ref<DtoUserLight | null>(null);
  const isTimeExpire = ref(true);

  const handlWrapperForTryingToLock = async (handlFunc: () => void) => {
    if (isTryingToLock.value) return;
    isTryingToLock.value = true;

    try {
      const gotLock = await tryingToLock();

      if (gotLock) {
        handlFunc();
      }
    } finally {
      isTryingToLock.value = false;
    }
  };

  async function tryingToLock(): Promise<boolean> {
    let delay = 800;
    const maxDelay = 5000;

    let res: AiplanIssueLockResponse | null = null;

    while (isTryingToLock.value) {
      res = await api.lockEditDescription(wsSlug, projectSlug, issueSlug);

      if (res?.ok) {
        stopTryingLock();
        setTimerUnlock(res?.locked_until ?? '');
      } else {
        if (res?.locked_by?.id === userStore.user.id) {
          stopLocking();
          isTryingToLock.value = true;
          continue;
        }

        lockedBy.value = res?.locked_by ?? null;

        const jitter = Math.floor(Math.random() * 250);
        await sleep(Math.min(delay + jitter, maxDelay));
        delay = Math.min(Math.floor(delay * 1.5), maxDelay);
      }
    }

    return res?.ok ?? false;
  }

  const stopTryingLock = () => {
    isTryingToLock.value = false;
    lockedBy.value = null;
  };

  const stopLocking = () => {
    stopTryingLock();

    if (unlockTimer) clearTimeout(unlockTimer);
    api.unlockEditDescription(wsSlug, projectSlug, issueSlug);
  };

  function setTimerUnlock(until: string) {
    if (unlockTimer) clearTimeout(unlockTimer);

    isTimeExpire.value = false;
    const expiresAt = new Date(until).getTime();
    const now = Date.now();
    const buffer = 2000;

    const msUntilSave = Math.max(0, expiresAt - now - buffer);

    unlockTimer = window.setTimeout(async () => {
      isTimeExpire.value = true;
    }, msUntilSave);
  }

  return {
    lockedBy,
    isTimeExpire,
    handlWrapperForTryingToLock,
    stopLocking,
  };
}
