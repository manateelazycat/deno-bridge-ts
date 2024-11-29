import { BridgeConfig, Message, MessageHandler } from "./types.ts";
import { WebSocketClient } from "./websocket_client.ts";

export class DenoBridge {
    private readonly config: BridgeConfig;
    private readonly messageHandler: MessageHandler;
    private server!: ReturnType<typeof Deno.serve>;
    private client!: WebSocketClient;

    constructor(config: BridgeConfig, messageHandler: MessageHandler) {
        this.config = config;
        this.messageHandler = messageHandler;
        this.setupServer();
        this.setupClient();
    }

    private  setupServer(): void {
        try {
            this.server = Deno.serve({
                port: this.config.denoPort,
                hostname: "127.0.0.1",
                handler: (request: Request) => {
                    if (request.headers.get("upgrade") === "websocket") {
                        try {
                            const { socket, response } = Deno.upgradeWebSocket(
                                request,
                            );
                            socket.onmessage = (event) =>
                                this.messageHandler(event.data);
                            socket.onerror = (error) =>
                                console.error("WebSocket error:", error);
                            return response;
                        } catch (error) {
                            console.error("WebSocket upgrade failed:", error);
                            return new Response("WebSocket upgrade failed", {
                                status: 400,
                            });
                        }
                    }
                    return new Response("Not a WebSocket request", {
                        status: 400,
                    });
                },
            });

            console.log(`Server listening on port ${this.config.denoPort}`);
        } catch (error) {
            console.error("Server setup failed:", error);
            throw error;
        }
    }

    private setupClient(): void {
        this.client = new WebSocketClient(this.config.emacsPort, this.config);
        this.client.connect(
            (data) => console.log("Received from Emacs:", data),
            () => console.log("Connected to Emacs server"),
        );
    }

    async messageToEmacs(message: string): Promise<void> {
        try {
            const payload: Message = {
                type: "show-message",
                content: message,
            };
            this.client.send(JSON.stringify(payload));
        } catch (error) {
            console.error("Failed to send message to Emacs:", error);
            throw error;
        }
    }

    async evalInEmacs(code: string): Promise<void> {
        try {
            const payload: Message = {
                type: "eval-code",
                content: code,
            };
            this.client.send(JSON.stringify(payload));
        } catch (error) {
            console.error("Failed to eval code in Emacs:", error);
            throw error;
        }
    }

    async getEmacsVar(varName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const client = new WebSocketClient(
                    this.config.emacsPort,
                    this.config,
                );
                let timeout: number;

                client.connect((data) => {
                    clearTimeout(timeout);
                    resolve(data);
                    client.close();
                });

                const payload: Message = {
                    type: "fetch-var",
                    content: varName,
                };

                timeout = setTimeout(() => {
                    client.close();
                    reject(new Error("Timeout waiting for Emacs variable"));
                }, 5000);

                client.send(JSON.stringify(payload));
            } catch (error) {
                reject(error);
            }
        });
    }

    close(): void {
        this.server.shutdown();
        this.client.close();
    }
}
