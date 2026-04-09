// contexts/chat/useChat.ts
import { useContext } from "react";
import { ChatContext, ChatContextType } from "./chatContext";

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};