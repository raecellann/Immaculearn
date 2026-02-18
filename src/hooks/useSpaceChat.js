import { useEffect, useRef, useState } from "react";
import useSocket from "./useSocket"; // import your hook

export function useSpaceChat(spaceUuid, user) {
  const { socket, isConnected } = useSocket(); // ✅ reuse singleton socket
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage for this specific space
    if (spaceUuid) {
      const savedMessages = localStorage.getItem(`chatMessages_${spaceUuid}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });
  const [spaceOnlineUsers, setSpaceOnlineUsers] = useState({}); // { spaceUuid: [userIds] }
  const previousSpaceRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (spaceUuid && messages.length > 0) {
      localStorage.setItem(`chatMessages_${spaceUuid}`, JSON.stringify(messages));
    }
  }, [messages, spaceUuid]);

  // 1️⃣ Handle socket events once connected
  useEffect(() => {
    if (!socket || !user || !isConnected) return;


    // Join globally
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
      console.log("Online users per space:", data);
    };
    socket.on("space_online_users_all", handleOnlineUsers);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("space_online_users_all", handleOnlineUsers);
    };
  }, [socket, user, isConnected]);

  // 2️⃣ Join new space & leave previous
  useEffect(() => {
    if (!socket || !spaceUuid) return;

    if (previousSpaceRef.current && previousSpaceRef.current !== spaceUuid) {
      socket.emit("leave_chat", { spaceUuid: previousSpaceRef.current });
    }

    socket.emit("join_chat", { spaceUuid });
    previousSpaceRef.current = spaceUuid;

    // Don't clear messages here - they're loaded from localStorage
  }, [spaceUuid, socket]);

  // 3️⃣ Send a message
  const sendMessage = (content, type = 'text', imageUrl = null) => {
    if (!socket || !user || !spaceUuid) return;

    const message = {
      id: window.crypto.randomUUID(),
      content,
      type,
      imageUrl,
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

  // 5️⃣ Send image message
  const sendImageMessage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Convert image to binary data
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // Get binary data as ArrayBuffer
      const arrayBuffer = event.target.result;
      
      // Convert to base64 for socket transmission
      const base64String = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Send message with binary data
      sendMessage(file.name, 'image', base64String);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // 4️⃣ Helper: online count in current space
  const getOnlineCount = () => {
    return spaceOnlineUsers[spaceUuid]?.filter((id) => id !== user.id).length || 0;
  };

  return { messages, sendMessage, sendImageMessage, spaceOnlineUsers, getOnlineCount };
}
