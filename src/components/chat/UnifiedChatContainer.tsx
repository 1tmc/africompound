// src/components/chat/UnifiedChatContainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import CompoundChatSidebar from './CompoundChatSidebar';
import CompoundChatRoom from './CompoundChatRoom';

interface PropertySummary {
  id: string;
  title: string;
}

// Strongly typed shape for the Supabase nested join query
interface ContractRoomResponse {
  property_id: string;
  properties: {
    title: string | null;
  } | null;
}

export default function UnifiedChatContainer() {
  const { currentUser } = useAuthStore();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = ['host', 'owner', 'admin'].includes(currentUser?.role || '');

  useEffect(() => {
    // Return early if currentUser is null to keep TypeScript happy
    if (!currentUser) return;

    // Capture the non-null user ID for type safety across async boundaries
    const userId = currentUser.id;

    async function setupView() {
      setLoading(true);
      if (isOwner) {
        // Owner pulls all their managed entities
        const { data } = await supabase
          .from('properties')
          .select('id, title')
          .eq('host_id', userId);

        if (data && data.length > 0) {
          setProperties(data);
          setActivePropertyId(data[0].id);
        }
      } else {
        // Tenant checks their active residential lease contract allocation map
        const { data } = await supabase
          .from('contracts')
          .select('rooms(property_id, properties(title))')
          .eq('tenant_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        // Strongly typed safe cast without using 'any'
        const roomAssigned = (data?.rooms as unknown as ContractRoomResponse) || null;
        
        if (roomAssigned?.property_id) {
          setActivePropertyId(roomAssigned.property_id);
          setProperties([
            {
              id: roomAssigned.property_id,
              title: roomAssigned.properties?.title || 'My Compound',
            },
          ]);
        }
      }
      setLoading(false);
    }

    void setupView();
  }, [currentUser, isOwner]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
        Loading channels...
      </div>
    );
  }

  // Early return fallback if user is null after loading
  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500 min-h-[300px]">
        Please sign in to access community messaging.
      </div>
    );
  }

  const activeProperty = properties.find((p) => p.id === activePropertyId);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch min-h-[600px]">
      {isOwner && (
        <CompoundChatSidebar
          properties={properties}
          activePropertyId={activePropertyId}
          onSelectProperty={setActivePropertyId}
        />
      )}

      {activePropertyId && activeProperty ? (
        <CompoundChatRoom
          propertyId={activePropertyId}
          propertyName={activeProperty.title}
          currentUserId={currentUser.id}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
          No active chat rooms available.
        </div>
      )}
    </div>
  );
}