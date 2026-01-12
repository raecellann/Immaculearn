import { createContext, useContext } from "react";
import { ChatMessage, SendMessageData } from "../../types/chat";

export interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (data: Omit<SendMessageData, "senderId">) => Promise<void>;
    loading: boolean;
    error: string | null;
    fetchMessages: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Custom hook
export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within a ChatProvider");
    return context;
};
