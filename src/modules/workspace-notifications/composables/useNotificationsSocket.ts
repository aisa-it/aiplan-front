import { onScopeDispose, readonly, ref } from 'vue';

const NOTIFICATIONS_SOCKET_PATH = '/api/auth/ws/notifications/';
const RECONNECT_BASE_DELAY = 1_000;
const RECONNECT_MAX_DELAY = 30_000;

export type NotificationsSocketStatus =
  | 'closed'
  | 'connecting'
  | 'open'
  | 'paused'
  | 'reconnecting';

export interface NotificationsSocketOpenContext {
  isReconnect: boolean;
}

export interface UseNotificationsSocketOptions {
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage: (payload: unknown, event: MessageEvent) => void;
  onOpen?: (context: NotificationsSocketOpenContext) => void;
  url?: string;
}

export const getNotificationsSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  return `${protocol}//${window.location.host}${NOTIFICATIONS_SOCKET_PATH}`;
};

export function useNotificationsSocket(
  options: UseNotificationsSocketOptions,
) {
  const status = ref<NotificationsSocketStatus>('closed');

  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let reconnectAttempt = 0;
  let shouldConnect = false;
  let hasConnected = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer === undefined) return;

    window.clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  };

  const releaseSocket = () => {
    if (!socket) return;

    const currentSocket = socket;
    socket = null;

    currentSocket.onclose = null;
    currentSocket.onerror = null;
    currentSocket.onmessage = null;
    currentSocket.onopen = null;

    if (
      currentSocket.readyState === WebSocket.CONNECTING ||
      currentSocket.readyState === WebSocket.OPEN
    ) {
      currentSocket.close();
    }
  };

  const scheduleReconnect = () => {
    if (
      !shouldConnect ||
      document.hidden ||
      reconnectTimer !== undefined
    ) {
      return;
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY * 2 ** reconnectAttempt,
      RECONNECT_MAX_DELAY,
    );

    reconnectAttempt += 1;
    status.value = 'reconnecting';
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = undefined;
      openSocket();
    }, delay);
  };

  const handleMessage = (event: MessageEvent) => {
    const payload =
      typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

    options.onMessage(payload, event);
  };

  const openSocket = () => {
    if (!shouldConnect) return;
    if (document.hidden) {
      status.value = 'paused';
      return;
    }
    if (
      socket?.readyState === WebSocket.CONNECTING ||
      socket?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    clearReconnectTimer();
    status.value = reconnectAttempt ? 'reconnecting' : 'connecting';

    const currentSocket = new WebSocket(
      options.url ?? getNotificationsSocketUrl(),
    );
    socket = currentSocket;

    currentSocket.onopen = () => {
      if (socket !== currentSocket) return;

      const isReconnect = hasConnected;

      hasConnected = true;
      reconnectAttempt = 0;
      status.value = 'open';
      options.onOpen?.({ isReconnect });
    };

    currentSocket.onmessage = handleMessage;

    currentSocket.onerror = (event) => {
      if (socket !== currentSocket) return;

      options.onError?.(event);
      currentSocket.close();
    };

    currentSocket.onclose = (event) => {
      if (socket !== currentSocket) return;

      socket = null;
      options.onClose?.(event);

      if (!shouldConnect) {
        status.value = 'closed';
        return;
      }

      scheduleReconnect();
    };
  };

  const connect = () => {
    shouldConnect = true;
    openSocket();
  };

  const disconnect = () => {
    shouldConnect = false;
    reconnectAttempt = 0;
    clearReconnectTimer();
    releaseSocket();
    status.value = 'closed';
  };

  const handleVisibilityChange = () => {
    if (!shouldConnect) return;

    if (document.hidden) {
      clearReconnectTimer();
      releaseSocket();
      status.value = 'paused';
      return;
    }

    openSocket();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  onScopeDispose(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    disconnect();
  });

  return {
    connect,
    disconnect,
    status: readonly(status),
  };
}
