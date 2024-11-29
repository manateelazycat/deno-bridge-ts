
import { BridgeConfig, ConnectionCallback } from "./types.ts";

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts: number;
    private readonly reconnectInterval: number;
    private readonly url: string;
    
    constructor(port: number, config: Partial<BridgeConfig> = {}) {
        this.url = `ws://127.0.0.1:${port}`;
        this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
        this.reconnectInterval = config.reconnectInterval ?? 3000;
    }

    connect(onMessage: (data: string) => void, onConnect?: ConnectionCallback): void {
        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log(`Connected to ${this.url}`);
                this.reconnectAttempts = 0;
                onConnect?.();
            };

            this.ws.onmessage = (event) => {
                onMessage(event.data);
            };

            this.ws.onclose = () => {
                console.log("Connection closed");
                this.reconnect(onMessage, onConnect);
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } catch (error) {
            console.error("Connection error:", error);
            this.reconnect(onMessage, onConnect);
        }
    }

    private reconnect(onMessage: (data: string) => void, onConnect?: ConnectionCallback): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(onMessage, onConnect), this.reconnectInterval);
        }
    }

    send(data: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.ws.send(data);
    }

    close(): void {
        this.ws?.close();
    }
}