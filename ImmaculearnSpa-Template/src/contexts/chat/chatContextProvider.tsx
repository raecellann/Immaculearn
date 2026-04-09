import React, { ReactNode, useCallback, useEffect } from "react";
import { ChatContext } from "./chatContext";
import { ChatMessage, SendMessageData } from "../../types/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys, fetchMessages, sendChatMessage } from "../../services/chatService";
import useSocket from "../../hooks/useSocket";
// import { useS } from "../../hooks/useSocket";



interface ChatProviderProps {
  spaceUuid: string | null;
  userId: string | null;
  children: ReactNode;
}

export const ChatProvider = ({ spaceUuid, userId, children }: ChatProviderProps) => {
  const queryClient = useQueryClient();

  const { socket } = useSocket();

  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        spaceUuid ? chatKeys.messages(spaceUuid) : chatKeys.all,
        (old = []) => [...old, message]
      );
    },
    [spaceUuid, queryClient]
  );

  const { connect, disconnect, isConnected } = socket({
    spaceUuid,
    onMessage: handleNewMessage,
    onError: console.error,
  });

  // 🔌 socket lifecycle
  useEffect(() => {
    if (!userId || !spaceUuid) return;

    connect(userId);

    return () => {
      disconnect();
    };
  }, [userId, spaceUuid, connect, disconnect]);

  // 📥 fetch history
  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: spaceUuid ? chatKeys.messages(spaceUuid) : chatKeys.all,
    queryFn: () => fetchMessages(spaceUuid!),
    enabled: !!spaceUuid,
  });

  // 📤 send message (REST → socket broadcast)
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageData) => sendChatMessage(data),
  });

  const sendMessage = async (data: Omit<SendMessageData, "senderId">) => {
    await sendMessageMutation.mutateAsync({
      ...data,
      senderId: userId!,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        loading: isLoading,
        error: isError ? "Failed to load messages" : null,
        fetchMessages: () =>
          queryClient.invalidateQueries({
            queryKey: spaceUuid ? chatKeys.messages(spaceUuid) : chatKeys.all,
          }),
        isConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
