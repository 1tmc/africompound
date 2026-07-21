"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Message = {
  id: number;
  sender: "user" | "assistant";
  text: string;
};

type ChatBoxProps = {
  title?: string;
  initialMessages?: Message[];
};

export function ChatBox({ title = "Joint System Chat", initialMessages = [] }: ChatBoxProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [draft, setDraft] = React.useState("");

  const handleSend = () => {
    if (!draft.trim()) return;

    const nextMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: draft.trim(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              message.sender === "user"
                ? "ml-auto bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}
