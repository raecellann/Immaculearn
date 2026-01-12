import { useEffect, useState } from "react";
import { getSpaceChat } from "../realtime/spaceChat";

export function useSpaceChat(spaceUuid, user) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!spaceUuid) return;

    const room = getSpaceChat(spaceUuid);

    const sync = () => {
      setMessages(room.messages.toArray());
    };

    room.messages.observe(sync);
    sync();

    return () => room.messages.unobserve(sync);
  }, [spaceUuid]);

  const sendMessage = (content) => {
    const room = getSpaceChat(spaceUuid);

    room.messages.push([
        {
        id: crypto.randomUUID(),
        content,
        senderId: user.id,
        senderName: user.fullname,       // Add full name
        senderAvatar: user.profile_pic,  // Add avatar
        timestamp: new Date().toISOString(),
        },
    ]);
    };


  return { messages, sendMessage };
}
