import { useEffect, useRef, useState } from "react";
import useSocket from "./useSocket"; // import your hook

export function useSpaceChat(spaceUuid, user) {
  const { socket, isConnected } = useSocket(); // ✅ reuse singleton socket
  const [messages, setMessages] = useState([]);
  const [spaceOnlineUsers, setSpaceOnlineUsers] = useState({}); // { spaceUuid: [userIds] }
  const previousSpaceRef = useRef(null);

  // 1️⃣ Handle socket events once connected AND spaceUuid is available
  useEffect(() => {
    if (!socket || !user || !isConnected || !spaceUuid) return;

    // Join globally
    console.log("Setting up chat for space:", spaceUuid, "user:", user.id);
    socket.emit("user:join", user.id);
    socket.emit("get_online_users");

    // Receive messages (single or array)
    const handleMessage = (msgOrArray) => {
      if (Array.isArray(msgOrArray)) {
        setMessages(msgOrArray);
      } else {
        setMessages((prev) => [...prev, msgOrArray]);
      }
    };
    socket.on("receive_message", handleMessage);

    // Receive online users per space
    const handleOnlineUsers = (data) => {
      setSpaceOnlineUsers(data);
    };
    socket.on("space_online_users_all", handleOnlineUsers);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("space_online_users_all", handleOnlineUsers);
    };
  }, [socket, user, isConnected, spaceUuid]);

  // 2️⃣ Join new space & leave previous
  useEffect(() => {
    if (!socket || !spaceUuid) return;

    if (previousSpaceRef.current && previousSpaceRef.current !== spaceUuid) {
      socket.emit("leave_chat", { spaceUuid: previousSpaceRef.current });
    }

    socket.emit("join_chat", { spaceUuid });
    previousSpaceRef.current = spaceUuid;

    setMessages([]); // clear while fetching messages
  }, [spaceUuid, socket]);

  // 3️⃣ Send a message
  const sendMessage = (content) => {
    if (!socket || !user || !spaceUuid) return;

    const message = {
      id: window.crypto.randomUUID(),
      content,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.profile_pic,
      timestamp: new Date().toISOString(),
      spaceUuid,
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);

    socket.emit("send_message", message);
  };

  // 4️⃣ Helper: online count in current space
  const getOnlineCount = () => {
    return (
      spaceOnlineUsers[spaceUuid]?.filter((id) => id !== user.id).length || 0
    );
  };

  return { messages, sendMessage, spaceOnlineUsers, getOnlineCount };
}
