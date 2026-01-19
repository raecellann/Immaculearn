import React, { useState, useMemo, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import Button from "../component/Button";
import { FiEdit, FiSend, FiMoreVertical } from "react-icons/fi";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceChat } from "../../hooks/useSpaceChat";
import { useUser } from "../../contexts/user/useUser";
import { GroupCover } from "../component/groupCover";

const ChatList = () => {
  const { userSpaces, friendSpaces } = useSpace();
  const { user } = useUser();

  const [activeSpaceUuid, setActiveSpaceUuid] = useState(null);
  const [input, setInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];

  const uniqueSpaces = useMemo(() => {
    const map = new Map();
    allSpaces.forEach((s) => map.set(s.space_uuid, s));
    return Array.from(map.values());
  }, [allSpaces]);

  const uniqueMembers = useMemo(() => {
    const map = new Map();
    allSpaces.flatMap((s) => s.members || []).forEach((m) => {
      if (m.account_id !== user.id && !map.has(m.account_id)) {
        map.set(m.account_id, m);
      }
    });
    return Array.from(map.values());
  }, [allSpaces, user.id]);

  // 🚀 Our hook to manage messages and online users
  const { messages, sendMessage, spaceOnlineUsers } =
    useSpaceChat(activeSpaceUuid, user);

  // Map messages to render-friendly format
  const chatMessages = useMemo(() => {
    return messages.map((m) => ({
      from: m.senderId === user.id ? "me" : "them",
      senderId: m.senderId,
      text: m.content,
      avatar: m.senderAvatar,
      time: new Date(m.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [messages, user.id]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const getPrivateSpaceUuid = (a, b) => [a, b].sort().join("-");

  const getOnlineCountForSpace = (space) => {
    return spaceOnlineUsers[space.space_uuid]?.filter(id => id !== user.id).length || 0;
  };

  const activeSpace = useMemo(() => {
    if (!activeSpaceUuid) return null;

    // Check if it's a private chat (between two users)
    const member = uniqueMembers.find(
      (m) => getPrivateSpaceUuid(user.id, m.account_id) === activeSpaceUuid
    );
    if (member) {
      return { space_name: member.full_name }; // 1:1 chat
    }

    // Otherwise, group chat
    return uniqueSpaces.find((s) => s.space_uuid === activeSpaceUuid) || null;
  }, [activeSpaceUuid, uniqueSpaces, uniqueMembers, user.id]);

  // Send message helper
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };
  

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex px-6 py-6 gap-6 h-screen overflow-hidden">
        {/* CHAT LIST */}
        <div className={`${showMobileChat ? "hidden lg:block" : "block"} w-full lg:w-[420px] flex flex-col`}>
          <div className="flex justify-between mb-4">
            <h1 className="font-bold text-lg">Chats</h1>
            <Button>
              <FiEdit />
            </Button>
          </div>

          {/* PEOPLE */}
          <div className="bg-white rounded-xl p-4 text-black mb-4 h-48 overflow-y-auto">
            <h2 className="font-semibold text-sm mb-3">People</h2>
            {uniqueMembers.map((m) => {
              const uuid = getPrivateSpaceUuid(user.id, m.account_id);
              return (
                <div
                  key={m.account_id}
                  onClick={() => {
                    setActiveSpaceUuid(uuid);
                    setShowMobileChat(true);
                  }}
                  className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <img
                    src={m.profile_pic || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold text-sm">{m.full_name}</p>
                </div>
              );
            })}
          </div>

          {/* GROUPS */}
          <div className="bg-white rounded-xl p-4 text-black h-48 overflow-y-auto">
            <h2 className="font-semibold text-sm mb-3">Groups</h2>
            {uniqueSpaces.map((space) => (
              <div
                key={space.space_uuid}
                onClick={() => {
                  setActiveSpaceUuid(space.space_uuid);
                  setShowMobileChat(true);
                }}
                className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <GroupCover
                  image={space.image}
                  name={space.space_name}
                  members={space.members.filter((m) => m.account_id !== user.id)}
                  className="w-10 h-10"
                />
                <div>
                  <p className="font-semibold text-sm">{space.space_name}</p>
                  <p className="text-xs text-gray-500">
                    {getOnlineCountForSpace(space)} online
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="flex-1 bg-white rounded-xl flex flex-col">
          {!activeSpaceUuid ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex justify-between">
                <h2 className="font-semibold text-black">{activeSpace?.space_name || "Chat"}</h2>
                <FiMoreVertical />
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    {m.from === "them" && (
                      <img src={m.avatar || "/default-avatar.png"} className="w-6 h-6 rounded-full mr-2" />
                    )}
                    <div className={`px-4 py-3 rounded-2xl max-w-xs ${m.from === "me" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                      <p className="text-sm">{m.text}</p>
                      <div className="text-[10px] text-right">{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    className="flex-1 bg-transparent outline-none text-black"
                    placeholder="Type message..."
                  />
                  <button onClick={handleSend} className="text-blue-500">
                    <FiSend />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
