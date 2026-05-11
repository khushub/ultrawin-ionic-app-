// services/socket/wsService.ts
// Auto-reconnects on server restart and rejoins the last event room

type WsEvent =
    | "event-pulse"
    | "joined"
    | "switched"
    | "left"
    | "authenticated"
    | "disconnected"
    | "reconnecting"
    | "error"
    | "pong";

type Handler = (data: any) => void;

const RECONNECT_DELAY_MS = 2000; // wait before first reconnect attempt
const RECONNECT_MAX_DELAY = 30000; // cap backoff at 30s
const PING_INTERVAL_MS = 25000; // keep-alive ping every 25s
const MAX_RECONNECT_TRIES = Infinity;

class WsService {
    private ws: WebSocket | null = null;
    private url: string = "";
    private token: string = "";
    private currentEventId: string | null = null; // ← the room to rejoin on reconnect
    private listeners: Map<string, Set<Handler>> = new Map();

    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private pingTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectDelay: number = RECONNECT_DELAY_MS;
    private reconnectCount: number = 0;
    private intentionalClose: boolean = false; // true = user called disconnect(), don't reconnect

    // ─── Public API ─────────────────────────────────────────────────────────────

    connect(baseUrl: string, token: string): void {
        const normalizedBase = baseUrl.replace(/\/+$/, ''); // remove trailing slash (one or more)
        this.url = normalizedBase.replace(/^http/, "ws"); // http→ws, https→wss
        this.token = token;
        this.intentionalClose = false;
        this._openSocket();
    }

    disconnect(): void {
        this.intentionalClose = true;
        this.currentEventId = null;
        this._clearTimers();
        if (this.ws) {
            this.ws.close(1000, "client disconnect");
            this.ws = null;
        }
        this._emit("disconnected", {});
    }

    // Call this when navigating to an event page
    // Internally sends 'join' (first time) or 'switch' (already in a room)
    joinEvent(eventId: string): void {
        this.currentEventId = eventId; // ← always store so reconnect can rejoin

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // Not connected yet — currentEventId is stored, will join after auth
            console.log(`[wsService] Not open yet, will join ${eventId} after connect`,);
            return;
        }

        this._sendJoinOrSwitch(eventId);
    }

    leaveEvent(eventId: string): void {
        // Clear the current event if we are actively leaving it
        if (this.currentEventId === eventId) {
            this.currentEventId = null;
        }
        
        // Tell the server to stop sending data for this room.
        // NOTE: Make sure the "type" matches what your backend expects! 
        // If your backend still uses the socket.io naming conventions, 
        // you might need to change "leave" to "remove-from-room".
        this._send({ type: "leave", eventId }); 
        
        console.log(`[wsService] Sent 'leave' for event ${eventId}`);
    }

    on(event: string, handler: Handler): void {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event)!.add(handler);
    }

    off(event: string, handler: Handler): void {
        this.listeners.get(event)?.delete(handler);
    }

    // ─── Internal ────────────────────────────────────────────────────────────────

    private _openSocket(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        const wsUrl = `${this.url}/ws?token=${encodeURIComponent(this.token)}`;
        console.log(`[wsService] Connecting to ${wsUrl}`);

        try {
            this.ws = new WebSocket(wsUrl);
        } catch (err) {
            console.error("[wsService] WebSocket constructor failed:", err);
            this._scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            console.log("[wsService] Connected");
            this.reconnectDelay = RECONNECT_DELAY_MS;
            this.reconnectCount = 0;
            this._startPing();
            // onmessage will fire 'authenticated' — we join room there
        };

        this.ws.onmessage = (event: MessageEvent) => {
            let msg: any;
            try {
                msg = JSON.parse(event.data);
            } catch {
                return;
            }

            const type: string = msg.type;

            // After server confirms auth, rejoin the last known event
            if (type === "authenticated") {
                this._emit("authenticated", msg);
                if (this.currentEventId) {
                    console.log(
                        `[wsService] Authenticated — rejoining event ${this.currentEventId}`,
                    );
                    this._sendJoinOrSwitch(this.currentEventId);
                }
                return;
            }

            this._emit(type, msg);
        };

        this.ws.onclose = (event: CloseEvent) => {
            console.warn(
                `[wsService] Closed: code=${event.code} reason=${event.reason}`,
            );
            this._clearPing();
            this._emit("disconnected", { code: event.code });

            if (!this.intentionalClose) {
                this._scheduleReconnect();
            }
        };

        this.ws.onerror = (err: Event) => {
            console.error("[wsService] Error:", err);
            this._emit("error", err);
            // onclose fires after onerror, so reconnect is handled there
        };
    }

    // Decide: send 'join' (no current room) or 'switch' (changing rooms)
    // After reconnect we always send 'join' since server lost state
    private _sendJoinOrSwitch(eventId: string): void {
        // If we just reconnected, server has no room state → use 'join'
        // If we're already in a room and switching → use 'switch'
        const alreadyInRoom = this.reconnectCount === 0;
        const type = alreadyInRoom ? "switch" : "join";

        this._send({ type, eventId });
        console.log(`[wsService] Sent '${type}' for event ${eventId}`);
    }

    private _send(data: object): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn("[wsService] send() called but socket not open");
        }
    }

    private _emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach((fn) => {
            try {
                fn(data);
            } catch (err) {
                console.error(`[wsService] Handler error for '${event}':`, err);
            }
        });
    }

    private _scheduleReconnect(): void {
        if (this.intentionalClose) return;
        if (this.reconnectTimer) return; // already scheduled

        this.reconnectCount++;
        console.log(
            `[wsService] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectCount})`,
        );
        this._emit("reconnecting", {
            attempt: this.reconnectCount,
            delay: this.reconnectDelay,
        });

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this._openSocket();

            // Exponential backoff, capped at max
            this.reconnectDelay = Math.min(
                this.reconnectDelay * 2,
                RECONNECT_MAX_DELAY,
            );
        }, this.reconnectDelay);
    }

    private _startPing(): void {
        this._clearPing();
        this.pingTimer = setInterval(() => {
            this._send({ type: "ping" });
        }, PING_INTERVAL_MS);
    }

    private _clearPing(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    private _clearTimers(): void {
        this._clearPing();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}

// Singleton — one connection shared across the app
const wsService = new WsService();
export default wsService;
