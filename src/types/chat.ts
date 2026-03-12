export interface ChatMessage {
    id: string; // unique message ID
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: string;
    status?: "sending" | "sent" | "error"; // optional local status
}

export interface ChatHistoryResponse {
    messages: ChatMessage[];
}

export interface SendMessageData {
    spaceUuid: string;
    content: string;
    senderId: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}
