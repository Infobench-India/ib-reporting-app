import { Socket } from "socket.io-client";
export declare const connectSocket: (url?: string) => Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
export declare const getSocket: () => Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap> | null;
export declare const disconnectSocket: () => void;
