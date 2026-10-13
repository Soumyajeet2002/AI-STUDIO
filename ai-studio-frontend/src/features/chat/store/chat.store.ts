import { create } from "zustand";

import { chatService } from "../services/chat.service";

import type {
  Chat,
  ChatMessage,
  CreateChatRequest,
} from "../types/chat.types";

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messagesByChatId: Record<string, ChatMessage[]>;

  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isMutating: boolean;

  error: string | null;

  fetchChats: () => Promise<void>;
  createChat: (payload: CreateChatRequest) => Promise<Chat>;
  selectChat: (chatId: string | null) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;

  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  moveChatToProject: (
    chatId: string,
    projectId: string | null,
  ) => Promise<void>;

  clearError: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    if (
      typeof a.sequenceNumber === "number" &&
      typeof b.sequenceNumber === "number"
    ) {
      return a.sequenceNumber - b.sequenceNumber;
    }

    return (
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
    );
  });
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  messagesByChatId: {},

  isLoadingChats: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isMutating: false,

  error: null,


  fetchChats: async () => {
    set({ isLoadingChats: true, error: null });

    try {
      const response = await chatService.getAll();

      const items = Array.isArray(response?.items)
        ? response.items
        : [];

      set({
        chats: items,
        isLoadingChats: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load chats",
        isLoadingChats: false,
      });

      throw error;
    }
  },


  createChat: async (payload) => {
    const title = payload.title.trim();

    if (!title) {
      throw new Error("Chat title cannot be empty.");
    }

    set({ isMutating: true, error: null });

    try {
      const chat = await chatService.create({
        ...payload,
        title,
      });

      set((state) => ({
        chats: [
          chat,
          ...state.chats.filter((item) => item.id !== chat.id),
        ],
        activeChatId: chat.id,
        messagesByChatId: {
          ...state.messagesByChatId,
          [chat.id]: state.messagesByChatId[chat.id] ?? [],
        },
        isMutating: false,
      }));

      return chat;
    } catch (error) {
      set({
        isMutating: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  selectChat: async (chatId) => {
    set({
      activeChatId: chatId,
      error: null,
    });

    if (!chatId) {
      return;
    }

    await get().fetchMessages(chatId);
  },

  renameChat: async (chatId, title) => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      throw new Error("Chat title cannot be empty.");
    }

    set({ isMutating: true, error: null });

    try {
      const updatedChat = await chatService.update(chatId, {
        title: normalizedTitle,
      });

      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, ...updatedChat, title: normalizedTitle }
            : chat,
        ),
        isMutating: false,
      }));
    } catch (error) {
      set({
        isMutating: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  deleteChat: async (chatId) => {
    set({ isMutating: true, error: null });

    try {
      await chatService.delete(chatId);

      set((state) => {
        const { [chatId]: _deletedMessages, ...remainingMessages } =
          state.messagesByChatId;

        return {
          chats: state.chats.filter((chat) => chat.id !== chatId),
          messagesByChatId: remainingMessages,
          activeChatId:
            state.activeChatId === chatId
              ? null
              : state.activeChatId,
          isMutating: false,
        };
      });
    } catch (error) {
      set({
        isMutating: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  fetchMessages: async (chatId) => {
    set({ isLoadingMessages: true, error: null });

    try {
      const messages = await chatService.getMessages(chatId);

      set((state) => ({
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: sortMessages(
            messages.filter((message) => message.chatId === chatId),
          ),
        },
        isLoadingMessages: false,
      }));
    } catch (error) {
      set({
        isLoadingMessages: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  sendMessage: async (chatId, content) => {
    const normalizedContent = content.trim();

    if (!normalizedContent) {
      throw new Error("Message cannot be empty.");
    }

    if (get().isSendingMessage) {
      throw new Error("A message is already being sent.");
    }

    if (!get().chats.some((chat) => chat.id === chatId)) {
      throw new Error("Chat not found. Refresh your chats and try again.");
    }

    set({ isSendingMessage: true, error: null });

    try {
      const message = await chatService.createMessage(chatId, {
        role: "user",
        content: normalizedContent,
      });

      if (message.chatId !== chatId || message.role !== "user") {
        throw new Error("The server returned an unexpected message.");
      }

      set((state) => ({
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: sortMessages([
            ...(state.messagesByChatId[chatId] ?? []).filter(
              (item) => item.id !== message.id,
            ),
            message,
          ]),
        },
        isSendingMessage: false,
      }));

      return message;
    } catch (error) {
      set({
        isSendingMessage: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  deleteMessage: async (chatId, messageId) => {
    set({ isMutating: true, error: null });

    try {
      await chatService.deleteMessage(chatId, messageId);

      set((state) => ({
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: (state.messagesByChatId[chatId] ?? []).filter(
            (message) => message.id !== messageId,
          ),
        },
        isMutating: false,
      }));
    } catch (error) {
      set({
        isMutating: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  moveChatToProject: async (chatId, projectId) => {
    const chat = get().chats.find((item) => item.id === chatId);

    if (!chat) {
      throw new Error("Chat not found.");
    }

    if ((chat.projectId ?? null) === projectId) {
      return;
    }

    set({ isMutating: true, error: null });

    try {
      const updatedChat = await chatService.update(chatId, {
        projectId,
      });

      set((state) => ({
        chats: state.chats.map((item) =>
          item.id === chatId
            ? { ...item, ...updatedChat, projectId }
            : item,
        ),
        isMutating: false,
      }));
    } catch (error) {
      set({
        isMutating: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to move chat to project.",
      });

      throw error;
    }
  },
  clearError: () => set({ error: null }),
}));