import type {
  Chat,
  ChatMessage,
} from "../types/chat.types";

export const mockChatMessages: ChatMessage[] = [
  {
    id: "mock-assistant-1",
    role: "assistant",
    content:
      "Hello. I'm ready to help you create, research, analyze, or execute your next task.",
    status: "completed",
    tokenUsage: {
      input: 0,
      output: 32,
      total: 32,
    },
    metadata: {
      model: "auto",
      createdAt: new Date().toISOString(),
    },
  },
];

export const mockChat: Chat = {
  id: "mock-chat",
  title: "New conversation",
  model: "auto",
  messages: mockChatMessages,
  tokenUsage: {
    input: 0,
    output: 32,
    total: 32,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};