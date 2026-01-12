// services/chatService.ts
import { api } from "../lib/api";
import { ChatMessage, SendMessageData, ChatHistoryResponse, ApiResponse } from "../types/chat";

export const chatKeys = {
    all: ['chats'] as const,
    spaces: () => [...chatKeys.all, 'spaces'] as const,
    messages: (spaceUuid: string) => [...chatKeys.spaces(), spaceUuid, 'messages'] as const,
};

type ChatQueryKey = ReturnType<typeof chatKeys.messages>;

export const fetchMessages = async (spaceUuid: string): Promise<ChatMessage[]> => {
    const response: ApiResponse<ChatHistoryResponse> = await api.get(`/spaces/${spaceUuid}/messages`);
    if (!response.success) throw new Error('Failed to fetch messages');
    return response.data.messages;
};

export const sendChatMessage = async (data: SendMessageData): Promise<ChatMessage> => {
    const res: ApiResponse<ChatMessage> = await api.post(`/spaces/${data.spaceUuid}/messages`, data);
    if (!res.success) throw new Error("Failed to send");
    return res.data;
};


class ChatService {
    /**
     * Fetch chat history for a space
     */
    async getMessages(spaceUuid: string): Promise<ChatMessage[]> {
        try {
            const response: ApiResponse<ChatHistoryResponse> = await api.get(`/spaces/${spaceUuid}/messages`);
            if (response.success) return response.data.messages;
            return [];
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            return [];
        }
    }

    /**
     * Send a new chat message
     */
    async sendMessage(data: SendMessageData): Promise<ChatMessage | null> {
        try {
            const response: ApiResponse<ChatMessage> = await api.post(`/spaces/${data.spaceUuid}/messages`, data);
            if (response.success) return response.data;
            return null;
        } catch (error) {
            console.error("Failed to send message:", error);
            return null;
        }
    }



    /**
     * Delete a message (optional)
     */
    async deleteMessage(spaceUuid: string, messageId: string): Promise<boolean> {
        try {
            const response: ApiResponse = await api.delete(`/spaces/${spaceUuid}/messages/${messageId}`);
            return response.success;
        } catch (error) {
            console.error("Failed to delete message:", error);
            return false;
        }
    }
}

export const chatService = new ChatService();
