import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatStore = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "africompound-chat-store",
    },
  ),
);
