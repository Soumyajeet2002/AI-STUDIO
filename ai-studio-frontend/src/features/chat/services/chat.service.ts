
import { apiClient } from "../../../services/api/api-client";

import type {
    Chat,
    ChatMessage,
    CreateChatRequest,
    CreateMessageRequest,
    UpdateChatRequest,
    UpdateMessageRequest,
    PaginatedChatsResponse,
} from "../types/chat.types";

export const chatService = {
    // Chats
    async getAll(): Promise<PaginatedChatsResponse> {
        return apiClient.get<PaginatedChatsResponse>("/chats");
    },

    async getById(chatId: string): Promise<Chat> {
        return apiClient.get<Chat>(
            `/chats/${encodeURIComponent(chatId)}`,
        );
    },

    async create(payload: CreateChatRequest): Promise<Chat> {
        return apiClient.post<Chat>("/chats", payload);
    },

    async update(
        chatId: string,
        payload: UpdateChatRequest,
    ): Promise<Chat> {
        return apiClient.patch<Chat>(
            `/chats/${encodeURIComponent(chatId)}`,
            payload,
        );
    },

    async delete(chatId: string): Promise<void> {
        await apiClient.delete<void>(
            `/chats/${encodeURIComponent(chatId)}`,
        );
    },

    // Messages
    async getMessages(chatId: string): Promise<ChatMessage[]> {
        return apiClient.get<ChatMessage[]>(
            `/chats/${encodeURIComponent(chatId)}/messages`,
        );
    },

    async createMessage(
        chatId: string,
        payload: CreateMessageRequest,
    ): Promise<ChatMessage> {
        return apiClient.post<ChatMessage>(
            `/chats/${encodeURIComponent(chatId)}/messages`,
            payload,
        );
    },

    async getMessage(
        chatId: string,
        messageId: string,
    ): Promise<ChatMessage> {
        return apiClient.get<ChatMessage>(
            `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
        );
    },

    async updateMessage(
        chatId: string,
        messageId: string,
        payload: UpdateMessageRequest,
    ): Promise<ChatMessage> {
        return apiClient.patch<ChatMessage>(
            `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
            payload,
        );
    },

    async deleteMessage(
        chatId: string,
        messageId: string,
    ): Promise<void> {
        await apiClient.delete<void>(
            `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
        );
    },
};
