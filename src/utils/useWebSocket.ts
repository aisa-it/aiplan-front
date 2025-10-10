import { ref } from 'vue';

export function useWebSocket(wsUrl: string) {
  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const reconnectInterval = 5000;
  const messages = ref<any[]>([]);
  let currentUrl = wsUrl;
  if (window.location.protocol === 'http:') {
    currentUrl = currentUrl.replace('wss://', 'ws://');
  }

  function connect(parser: (event: any) => void) {
    if (isConnected.value || socket.value) return;

    socket.value = new WebSocket(currentUrl);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log('WebSocket open');
    };

    socket.value.onmessage = (event) => {
      if (event.data) {
        try {
          const message = parser(event);
          messages.value.unshift(message);
        } catch {
          return;
        }
      }
    };

    socket.value.onclose = (event) => {
      isConnected.value = false;
      console.log('WebSocket close', event.reason);
      socket.value = null;
    };

    socket.value.onerror = (error) => {
      console.error('Error WebSocket:', error);

      if (currentUrl.startsWith('wss://')) {
        currentUrl = currentUrl.replace('wss://', 'ws://');
        console.log(`WebSocket fallback to ${currentUrl}`);
      }

      socket.value?.close();
      setTimeout(() => {
        connect(parser);
      }, reconnectInterval);
    };
  }

  function disconnect() {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
      isConnected.value = false;
      currentUrl = wsUrl;
    }
  }

  function clear() {
    messages.value = [];
  }

  return {
    socket,
    messages,
    isConnected,
    clear,
    connect,
    disconnect,
  };
}
