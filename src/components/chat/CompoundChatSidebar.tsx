// src/components/chat/CompoundChatSidebar.tsx
'use client';
import React from 'react';
import { Building2, MessageSquare } from 'lucide-react';

interface PropertySummary {
  id: string;
  title: string;
}

interface CompoundChatSidebarProps {
  properties: PropertySummary[];
  activePropertyId: string | null;
  onSelectProperty: (id: string) => void;
}

export default function CompoundChatSidebar({
  properties,
  activePropertyId,
  onSelectProperty,
}: CompoundChatSidebarProps) {
  return (
    <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Compounds
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">Switch between property chats</p>
      </div>

      <div className="space-y-1 overflow-y-auto flex-1 pr-1">
        {properties.map((prop) => {
          const isActive = prop.id === activePropertyId;
          return (
            <button
              key={prop.id}
              onClick={() => onSelectProperty(prop.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                isActive
                  ? 'bg-[#E03A1D] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <Building2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
              <span className="truncate">{prop.title}</span>
            </button>
          );
        })}
        {properties.length === 0 && (
          <p className="text-center py-6 text-xs text-slate-400 dark:text-zinc-500">No compounds managed.</p>
        )}
      </div>
    </div>
  );
}