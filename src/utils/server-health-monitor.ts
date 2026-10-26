import { toast } from '@/modules/toast/toast';

const HEALTH_CHECK_INTERVAL = 5000;
const HEALTH_CHECK_TIMEOUT = 5000;
const SERVER_UNAVAILABLE_MESSAGE =
  'Сервер сейчас недоступен. Сохраните свои данные!';

let monitoring = false;
let unavailableToastShown = false;
let retryTimer: number | undefined;
let dismissUnavailableToast: (() => void) | undefined;

const checkServerHealth = async () => {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    HEALTH_CHECK_TIMEOUT,
  );

  try {
    const response = await fetch('/api/_health/', {
      cache: 'no-store',
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
};

const resetMonitor = () => {
  if (retryTimer !== undefined) {
    window.clearTimeout(retryTimer);
    retryTimer = undefined;
  }

  dismissUnavailableToast?.();
  dismissUnavailableToast = undefined;
  unavailableToastShown = false;
  monitoring = false;
};

const scheduleHealthCheck = () => {
  retryTimer = window.setTimeout(() => {
    retryTimer = undefined;
    void runHealthCheck();
  }, HEALTH_CHECK_INTERVAL);
};

const runHealthCheck = async () => {
  const isAvailable = await checkServerHealth();

  if (isAvailable) {
    resetMonitor();
    return;
  }

  if (!unavailableToastShown) {
    dismissUnavailableToast = toast.error(SERVER_UNAVAILABLE_MESSAGE, {
      timeout: 0,
    });
    unavailableToastShown = true;
  }

  scheduleHealthCheck();
};

export const startServerHealthMonitor = () => {
  if (monitoring) return;

  monitoring = true;
  void runHealthCheck();
};
