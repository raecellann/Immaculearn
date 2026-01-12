import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

const rooms = {};

export function getSpaceChat(spaceUuid) {
  if (rooms[spaceUuid]) return rooms[spaceUuid];

  const doc = new Y.Doc();

  const ws = new WebsocketProvider(
    "ws://localhost:3000",
    `space-chat-${spaceUuid}`,
    doc
  );

  const persistence = new IndexeddbPersistence(`space-${spaceUuid}`, doc);

  const messages = doc.getArray("messages");

  rooms[spaceUuid] = { doc, ws, persistence, messages };
  return rooms[spaceUuid];
}
