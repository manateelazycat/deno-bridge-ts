export class StandardWebSocketClient extends WebSocket {
    constructor(url: string) {
        super(url);
    }

    // Additional methods or overrides can be added here if needed
    override send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.readyState === WebSocket.OPEN) {
            super.send(data);
        } else {
            this.addEventListener('open', () => super.send(data), { once: true });
        }
    }
}