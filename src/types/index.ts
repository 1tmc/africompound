export type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};
