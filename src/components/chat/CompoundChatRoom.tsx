// src/components/chat/CompoundChatRoom.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SenderProfile {
  first_name: string;
  last_name: string;
  role: string;
}

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  sender_profile?: SenderProfile;
}

interface CompoundChatRoomProps {
  propertyId: string;
  propertyName: string;
  currentUserId: string;
}

export default function CompoundChatRoom({ propertyId, propertyName, currentUserId }: CompoundChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      // Cast the client dynamically to unknown first to bypass type restrictions without using 'any'
      const client = supabase as unknown as {
        from: (table: string) => {
          select: (query: string) => {
            eq: (column: string, value: string) => {
              order: (column: string, opts: { ascending: boolean }) => Promise<{
                data: ChatMessage[] | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      };

      const { data, error } = await client
        .from('compound_messages')
        .select('*, sender_profile:profiles!sender_id(first_name, last_name, role)')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    }
    void fetchMessages();
  }, [propertyId]);

  // Real-time Subscriptions setup
  useEffect(() => {
    const channel = supabase
      .channel(`compound-chat-${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'compound_messages',
          filter: `property_id=eq.${propertyId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Omit<ChatMessage, 'sender_profile'>;

          // Fetch the profile attachment data for the newly appended message
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role')
            .eq('id', newMsg.sender_id)
            .single();

          const completeMessage: ChatMessage = {
            ...newMsg,
            sender_profile: (profile as SenderProfile | null) || undefined,
          };

          setMessages((prev) => [...prev, completeMessage]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [propertyId]);

  // Auto scroll down upon receipt of text strings
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);

    const client = supabase as unknown as {
      from: (table: string) => {
        insert: (payload: { property_id: string; sender_id: string; message: string }) => Promise<{
          error: { message: string } | null;
        }>;
      };
    };

    const { error } = await client.from('compound_messages').insert({
      property_id: propertyId,
      sender_id: currentUserId,
      message: input.trim(),
    });

    if (error) {
      console.error('Failed to send text:', error.message);
    } else {
      setInput('');
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-zinc-900/20 h-[600px] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Top Banner Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
            {propertyName} Community Chat
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Text messaging channel</p>
        </div>
      </div>

      {/* Main Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isAdmin = ['host', 'owner', 'admin'].includes(msg.sender_profile?.role || '');

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400">
                  {msg.sender_profile?.first_name} {msg.sender_profile?.last_name}
                </span>
                {isAdmin && (
                  <span className="flex items-center gap-0.5 px-1 rounded bg-amber-100 text-amber-800 text-[8px] font-black uppercase dark:bg-amber-950/40 dark:text-amber-400">
                    <Shield className="h-2 w-2" /> Admin
                  </span>
                )}
              </div>
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                  isMe
                    ? 'bg-[#E03A1D] text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none dark:bg-zinc-800 dark:text-zinc-200'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Action Footer Inputs Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Drop a concern or message..."
          className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs outline-none text-slate-800 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200 focus:border-slate-300 dark:focus:border-zinc-700"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-slate-950 text-white rounded-xl px-4 py-2.5 flex items-center justify-center hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white disabled:opacity-40 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}