import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiUsers } from 'react-icons/fi';

const ChatPopup = ({ 
  isOpen, 
  onClose, 
  spaceName, 
  currentUser, 
  spaceMembers = [],
  onSendMessage,
  className = ""
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showMembersList, setShowMembersList] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      // Create new message object
      const newMsg = {
        id: Date.now(),
        senderId: currentUser?.id,
        senderName: currentUser?.fullname || 'You',
        text: newMessage.trim(),
        timestamp: 'Just now',
        avatar: currentUser?.profile_pic,
        isRead: false
      };
      
      // Add message to local state
      setMessages(prev => [...prev, newMsg]);
      
      // Call parent handler
      onSendMessage(newMessage.trim());
      
      // Clear input
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E222A] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2A2F3A] to-[#1E222A] p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiMessageCircle className="text-blue-400" size={24} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E222A]"></div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {spaceName} Chat
                </h2>
                <p className="text-xs text-gray-400">
                  {spaceMembers.length} members • {messages.length} messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMembersList(!showMembersList)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="View Members"
              >
                <FiUsers size={20} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Close Chat"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        {showMembersList && (
          <div className="bg-[#141820] border-b border-gray-700 p-4">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {spaceMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#2A2F3A] transition-colors">
                  <img
                    src={member.avatar || "/src/assets/HomePage/frieren-avatar.jpg"}
                    alt={member.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    member.online ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#141820]">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <FiMessageCircle className="text-gray-500 mx-auto" size={64} />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-gray-300 text-xl font-semibold mb-2">
                Welcome to {spaceName} Chat
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Start a conversation with space members
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser?.id;
            return (
              <div key={index} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                <img
                  src={message.avatar || "/src/assets/HomePage/frieren-avatar.jpg"}
                  alt={message.senderName}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className={`flex flex-col max-w-xs lg:max-w-md ${isCurrentUser ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    isCurrentUser 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-gray-700 text-white rounded-bl-sm'
                  }`}>
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <div className={`flex items-center gap-2 mt-1 text-xs ${
                    isCurrentUser ? 'flex-row-reverse' : ''
                  }`}>
                    <span className="text-gray-500">{message.senderName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{message.timestamp}</span>
                    {message.isRead && isCurrentUser && (
                      <span className="text-blue-400">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-700 bg-[#1E222A]">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-[#2A2F3A] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none transition-all"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: newMessage.split('\n').length > 1 ? 'auto' : '44px'
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                newMessage.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{newMessage.length}/500</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
