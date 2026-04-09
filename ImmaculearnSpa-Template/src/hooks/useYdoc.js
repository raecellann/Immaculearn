import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import config from "../config";

export default function useYDoc(space_uuid, group_id) {
  const [ydoc, setYdoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [ytext, setYText] = useState(null);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!space_uuid || !group_id) return;

    const roomId = `${space_uuid}-${group_id}`;
    const baseUrl =
      config.VITE_ENV === "production"
        ? config.CRDT_URL
        : "ws://localhost:3000/crdt";

    const doc = new Y.Doc();
    const text = doc.getText("document"); // ✅ Important: bind this

    const wsProvider = new WebsocketProvider(baseUrl, roomId, doc);

    wsProvider.on("status", (event) =>
      console.log("CRDT status:", event.status),
    );
    wsProvider.on("sync", (synced) => {
      console.log("CRDT synced:", synced);
      setIsSynced(synced);
    });

    setYdoc(doc);
    setYText(text);
    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, [space_uuid, group_id]);

  return { ydoc, provider, ytext, isSynced };
}
