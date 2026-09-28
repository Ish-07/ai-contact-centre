type EventCallback = (event: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: EventCallback[] = [];
  private reconnectTimer: any = null;

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/live`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to live contact center stream');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notify(data);
        } catch (e) {
          console.error('[WebSocket] Failed to parse message', e);
        }
      };

      this.socket.onclose = () => {
        console.log('[WebSocket] Connection closed. Attempting reconnect in 3s...');
        this.reconnect();
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Error occurred', error);
      };
    } catch (e) {
      console.error('[WebSocket] Setup failed', e);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  subscribe(cb: EventCallback) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== cb);
    };
  }

  private notify(data: any) {
    this.listeners.forEach((fn) => fn(data));
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsClient = new WebSocketClient();
