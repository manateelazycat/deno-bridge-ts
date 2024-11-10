
export interface Message {
    type: 'show-message' | 'eval-code' | 'fetch-var';
    content: string;
}

export interface BridgeConfig {
    appName: string;
    denoPort: number;
    emacsPort: number;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export type MessageHandler = (message: string) => void;
export type ConnectionCallback = () => void;