import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export function createChatRoom(roomId: string) {
    const ydoc = new Y.Doc();

    const ws = new WebsocketProvider(
        "ws://localhost:3000",
        `chat-${roomId}`,
        ydoc
    );

    const persistence = new IndexeddbPersistence(`chat-${roomId}`, ydoc);

    const conversations = ydoc.getMap<Y.Array<any>>("conversations");

    return { ydoc, ws, persistence, conversations };
}
