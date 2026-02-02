import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const providers = new Map();

export function getYjsProvider(roomName) {
  if (typeof window === "undefined") return null; // Prevent SSR errors

  if (!providers.has(roomName)) {
    const doc = new Y.Doc();

    // const wsUrl = "ws://localhost:3001"; // Must match your CRDT server

    // Connect to Yjs server using roomName
    const wsUrl = "ws://localhost:3001/crdt"; // just /crdt
    const provider = new WebsocketProvider(`${wsUrl}`, roomName, doc);

    // const provider = new WebsocketProvider(`${wsUrl}/crdt`, roomName, doc);

    provider.on("status", event => {
      console.log(`[${roomName}] Connection status:`, event.status);
    });

    provider.on("synced", () => {
      console.log(`[${roomName}] Synced with server`);
    });

    const yText = doc.getText("editor");
    yText.observe(() => {
      console.log(`[${roomName}] Yjs update →`, yText.toString());
    });

    providers.set(roomName, { provider, doc, yText });
  }

  return providers.get(roomName);
}

export function cleanupProvider(roomName) {
  const providerData = providers.get(roomName);
  if (providerData) {
    providerData.provider.destroy();
    providers.delete(roomName);
  }
}
