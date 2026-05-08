import { ref } from 'vue';
import { api } from '../services/api';
import { useUserStore } from 'src/stores/user-store';
import type {
  DtoIssueLockResponse,
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

  const isTryingToLock = ref<boolean>(false);
  const lockedBy = ref<DtoUserLight | null>(null);
  const isTimeExpire = ref<boolean>(true);

  const isLockPending = ref<boolean>(false);
  // Переменные для хранения обрабатывающихся запросов. Если не null, то идет запрос на lock/unlock
  let lockInProcess: Promise<boolean> | null = null;
  let unlockInProcess: Promise<void> | null = null;

  const handlWrapperForTryingToLock = async (
    handlFunc: () => void | Promise<void>,
  ) => {
    // Не создаем новый вызов, если есть активный запрос на lock
    if (lockInProcess) {
      const gotLock = await lockInProcess;
      if (gotLock) {
        await handlFunc();
      }
      return;
    }

    isTryingToLock.value = true;
    isLockPending.value = true;

    // Исполнение и запись вызова в переменную
    lockInProcess = (async () => {
      try {
        const gotLock = await tryingToLock();
        return gotLock;
      } finally {
        isLockPending.value = false;
        lockInProcess = null;
      }
    })();

    // Если вызов прошел - исполняем функцию из аргумента
    try {
      const isLocked = await lockInProcess;

      if (isLocked) {
        await handlFunc();
      }
    } finally {
      isTryingToLock.value = false;
    }
  };

  async function tryingToLock(): Promise<boolean> {
    let delay = 800;
    const maxDelay = 5000;

    let res: DtoIssueLockResponse | null = null;

    while (isTryingToLock.value) {
      res = await api.lockEditDescription(wsSlug, projectSlug, issueSlug);

      if (res?.ok) {
        stopTryingLock();
        setTimerUnlock(res?.locked_until ?? '');
        return true;
      }

      if (res?.locked_by?.id === userStore.user.id) {
        await stopLocking();
        isTryingToLock.value = true;
        continue;
      }

      lockedBy.value = res?.locked_by ?? null;

      const jitter = Math.floor(Math.random() * 250);
      await sleep(Math.min(delay + jitter, maxDelay));
      delay = Math.min(Math.floor(delay * 1.5), maxDelay);
    }

    return false;
  }

  const stopTryingLock = () => {
    isTryingToLock.value = false;
    lockedBy.value = null;
  };

  const stopLocking = async () => {
    stopTryingLock();

    if (unlockTimer) {
      clearTimeout(unlockTimer);
      unlockTimer = null;
    }

    // Не создаем новый вызов, если есть активный запрос на unlock
    if (unlockInProcess) {
      await unlockInProcess;
      return;
    }

    isLockPending.value = true;

    // Запись вызова в переменную
    unlockInProcess = (async () => {
      try {
        await api.unlockEditDescription(wsSlug, projectSlug, issueSlug);
      } finally {
        unlockInProcess = null;
        isLockPending.value = false;
      }
    })();

    await unlockInProcess;
  };

  function setTimerUnlock(until: string) {
    if (unlockTimer) clearTimeout(unlockTimer);

    isTimeExpire.value = false;
    const expiresAt = new Date(until).getTime();
    const now = Date.now();
    const buffer = 2000;

    const msUntilSave = Math.max(0, expiresAt - now - buffer);

    unlockTimer = window.setTimeout(() => {
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
