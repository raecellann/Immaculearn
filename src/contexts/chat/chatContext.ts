// contexts/chat/chatContext.ts
import { createContext } from "react";
import { ChatMessage, SendMessageData } from "../../types/chat";

export interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (data: Omit<SendMessageData, "senderId">) => Promise<void>;
    loading: boolean;
    error: string | null;
    fetchMessages: (spaceUuid: string) => Promise<void>;
    isConnected: boolean;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);