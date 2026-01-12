import React, { useState, useMemo } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Combine all spaces
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];

  // Flatten unique members for private chats
  const uniqueMembers = useMemo(() => {
    const allMembers = allSpaces.flatMap((s) => s.members || []);
    const map = new Map();
    allMembers.forEach((m) => {
      if (m.account_id && m.account_id !== user.id && !map.has(m.account_id)) {
        map.set(m.account_id, m);
      }
    });
    return Array.from(map.values());
  }, [allSpaces, user.id]);

  // Unique spaces (groups)
  const uniqueSpaces = useMemo(() => {
    const map = new Map();
    allSpaces.forEach((space) => map.set(space.space_uuid, space));
    return Array.from(map.values());
  }, [allSpaces]);

  // Initialize chat messages for the active space
  const { messages, sendMessage } = useSpaceChat(activeSpaceUuid, user);

  // Map messages for display
  const chatMessages = useMemo(() => {
    return messages.map((m) => ({
      from: m.senderId === user.id ? "me" : "them",
      text: m.content,
      avatar: m.senderAvatar,
      name: m.senderName,
      time: new Date(m.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [messages, user]);

  // Deterministic UUID for 1-on-1 private chat
  const getPrivateSpaceUuid = (userId1, userId2) => [userId1, userId2].sort().join("-");

  // Determine if current chat is private
  const isPrivateChat = !uniqueSpaces.find((s) => s.space_uuid === activeSpaceUuid);

  // Build active space object for display
  const activeSpaceDisplay = isPrivateChat
    ? (() => {
        const memberIds = activeSpaceUuid?.split("-");
        const otherMember = uniqueMembers.find(
          (m) => String(m.account_id) === memberIds?.find((id) => id !== String(user.id))
        );
        return {
          space_name: otherMember?.full_name || "Private Chat",
          members: otherMember ? [otherMember] : [],
        };
      })()
    : uniqueSpaces.find((s) => s.space_uuid === activeSpaceUuid);

  const handleSend = () => {
    if (!input.trim() || !activeSpaceUuid) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex px-6 py-6 gap-6 h-screen overflow-hidden">
        {/* CHAT LIST */}
        <div className={`${showMobileChat ? "hidden lg:block" : "block"} w-full lg:w-[420px] flex flex-col min-h-0`}>
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-bold">Chats</h1>
            <Button style={{ padding: "0.4rem", backgroundColor: "#3B82F6", borderRadius: "8px" }}>
              <FiEdit />
            </Button>
          </div>

          <input
            placeholder="Search People"
            className="w-full mb-4 px-4 py-2 rounded-full bg-[#EDEAF0] text-black text-sm"
          />

          {/* PEOPLE (Private Messages) */}
          <div className="bg-white rounded-xl p-4 text-black mb-4 overflow-y-auto h-48">
            <h2 className="text-sm font-semibold mb-3">People</h2>
            {uniqueMembers.length > 0 ? (
              uniqueMembers.map((member) => {
                const privateUuid = getPrivateSpaceUuid(user.id, member.account_id);
                return (
                  <div
                    key={member.account_id}
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2"
                    onClick={() => {
                      setActiveSpaceUuid(privateUuid);
                      setShowMobileChat(true);
                    }}
                  >
                    <img src={member.profile_pic || "/default-avatar.png"} className="w-10 h-10 rounded-full" />
                    <p className="font-semibold text-sm">{member.full_name}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400">No people found.</p>
            )}
          </div>

          {/* GROUPS */}
          <div className="bg-white rounded-xl p-4 text-black overflow-y-auto h-48">
            <h2 className="text-sm font-semibold mb-3">Groups</h2>
            {uniqueSpaces.map((space) => (
              <div
                key={space.space_uuid}
                onClick={() => {
                  setActiveSpaceUuid(space.space_uuid);
                  setShowMobileChat(true);
                }}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2"
              >
                <GroupCover
                  image={space.image}
                  name={space.space_name}
                  members={space.members?.slice(0, 2)} // first 2 members only
                  className="w-10 h-10 rounded-full"
                />
                <p className="font-semibold text-sm">{space.space_name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="flex-1 flex">
          {!activeSpaceUuid ? (
            <div className="flex-1 bg-white rounded-xl flex items-center justify-center text-gray-400">
              Select a Message
            </div>
          ) : (
            <div className="bg-white rounded-xl w-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-semibold text-black text-lg">
                  {activeSpaceDisplay?.space_name}
                </h2>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <FiMoreVertical />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                      {m.from === "them" && (
                        <img
                          src={m.avatar || "/default-avatar.png"}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl ${
                          m.from === "me" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                        }`}
                      >
                        <p className="text-sm">{m.text}</p>
                        <div className="flex justify-end text-[10px] mt-1">{m.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-blue-500 text-white p-2 rounded-full"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatList;
