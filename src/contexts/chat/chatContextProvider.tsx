import React, { ReactNode } from "react";
import { ChatContext } from "./chatContext";
import { ChatMessage, SendMessageData } from "../../types/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys, fetchMessages, sendChatMessage } from "../../services/chatService";

interface ChatProviderProps {
  spaceUuid: string;
  userId: string;
  children: ReactNode;
}

export const ChatProvider = ({ spaceUuid, userId, children }: ChatProviderProps) => {
  const queryClient = useQueryClient();

  // ------------------------
  // MESSAGES QUERY
  // ------------------------
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: chatKeys.messages(spaceUuid),
    queryFn: () => fetchMessages(spaceUuid),
    enabled: !!spaceUuid,
    staleTime: 30_000,
  });

  // ------------------------
  // SEND MESSAGE MUTATION
  // ------------------------
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageData) => sendChatMessage(data),

    // Optimistic UI
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(spaceUuid),
      });

      const previousMessages = queryClient.getQueryData<ChatMessage[]>(
        chatKeys.messages(spaceUuid)
      );

      const tempMessage: ChatMessage = {
        id: "temp-" + Date.now(),
        content: data.content,
        senderId: userId,
        senderName: "Me",
        timestamp: new Date().toISOString(),
        status: "sending",
      };

      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(spaceUuid),
        (old = []) => [...old, tempMessage]
      );

      return { previousMessages, tempId: tempMessage.id };
    },

    onSuccess: (saved, _, context) => {
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(spaceUuid),
        (old = []) =>
          old.map((msg) => (msg.id === context?.tempId ? saved : msg))
      );
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(
        chatKeys.messages(spaceUuid),
        context?.previousMessages
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(spaceUuid),
      });
    },
  });

  const sendMessage = async (data: Omit<SendMessageData, "senderId">) => {
    await sendMessageMutation.mutateAsync({
      ...data,
      senderId: userId,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        loading: isLoading,
        error: isError ? "Failed to load messages" : null,
        fetchMessages: async () => {
          await queryClient.invalidateQueries({
            queryKey: chatKeys.messages(spaceUuid),
          });
        },
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
