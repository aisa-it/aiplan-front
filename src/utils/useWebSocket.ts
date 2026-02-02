import { onUnmounted } from 'vue';

export function useWebSocket(wsUrl: string) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;

  let retryCount = 0;
  const MAX_RETRIES = 5;
  const BASE_DELAY = 2000;

  let isManuallyClosed = false;

  const initialUrl = wsUrl;
  let currentUrl = normalizeUrl(wsUrl);

  let onMessageFunc: ((event: MessageEvent) => void) | null = null;

  function normalizeUrl(url: string) {
    if (window.location.protocol === 'http:') {
      return url.replace('wss://', 'ws://');
    }
    return url;
  }

  function fallbackToWs() {
    if (currentUrl.startsWith('wss://')) {
      currentUrl = currentUrl.replace('wss://', 'ws://');
      console.log(`WebSocket fallback to ${currentUrl}`);
      return true;
    }
    return false;
  }

  function cleanupSocket() {
    if (!socket) return;

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
  }

  function connect(onMessage: (event: MessageEvent) => void) {
    if (socket) return;
    if (retryCount >= MAX_RETRIES) {
      console.warn('WebSocket max retries reached, stop reconnecting');
      return;
    }

    onMessageFunc = onMessage;

    isManuallyClosed = false;
    socket = new WebSocket(currentUrl);

    socket.onopen = () => {
      retryCount = 0;
      console.log('WebSocket open');
    };

    socket.onmessage = onMessage;

    socket.onclose = (event) => {
      console.log('WebSocket close', event.reason);

      cleanupSocket();
      socket = null;

      if (!isManuallyClosed) {
        scheduleReconnect(onMessage);
      }
    };

    socket.onerror = (error) => {
      console.error('Error WebSocket:', error);

      cleanupSocket();

      if (fallbackToWs()) {
        socket?.close();
        return;
      }

      socket?.close();
    };
  }

  function scheduleReconnect(onMessage: (event: MessageEvent) => void) {
    if (reconnectTimer) return;

    retryCount++;

    const delay = BASE_DELAY * retryCount;

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect(onMessage);
    }, delay);
  }

  function disconnect() {
    isManuallyClosed = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    cleanupSocket();
    socket?.close();
    socket = null;
    currentUrl = normalizeUrl(initialUrl);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      disconnect();
    } else {
      if (onMessageFunc) connect(onMessageFunc);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    disconnect();
  });

  return {
    connect,
    disconnect,
  };
}
