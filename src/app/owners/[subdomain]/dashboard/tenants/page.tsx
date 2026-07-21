// src/app/owners/[subdomain]/dashboard/tenants/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  DashboardContractQueryResult,
  DashboardRoomSummary,
} from '@/types/dashboard';
import TenantsPageHeader from '@/components/tenants/TenantsPageHeader';
import MessageBanner from '@/components/tenants/MessageBanner';
import TipBanner from '@/components/tenants/TipBanner';
import StatsOverview from '@/components/tenants/StatsOverview';
import FilterBar from '@/components/tenants/FilterBar';
import TenantGrid from '@/components/tenants/TenantGrid';
import OnboardTenantModal from '@/components/tenants/OnboardTenantModal';
import type {
  AppMessage,
  NewTenantFormState,
  PropertySummary,
  StatusFilter,
  TenantDisplayModelExtended,
} from '@/components/tenants/types';

interface PageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

interface RawRoomRecord {
  id: string;
  room_number: string;
  status: string;
  property_id: string;
  properties: { id: string; title: string; host_id: string } | { id: string; title: string; host_id: string }[] | null;
}

interface BillInsertRecord {
  room_id: string;
  tenant_id: string;
  bill_type: string;
  amount: number;
  currency: string;
  due_date: string;
  is_recurring: boolean;
  status: 'pending' | 'paid' | 'unpaid';
}

interface RoomUpdateRecord {
  price_per_month: number;
  currency: string;
  status: 'occupied' | 'vacant';
}

export default function TenantsDirectoryPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const subdomainSlug = resolvedParams?.subdomain;

  // Sync with Zustand Auth Store
  const { currentUser, isInitialized } = useAuthStore();

  // Application State
  const [tenants, setTenants] = useState<TenantDisplayModelExtended[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [rooms, setRooms] = useState<DashboardRoomSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Controlled Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [newTenant, setNewTenant] = useState<NewTenantFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roomId: '',
    startDate: '',
    endDate: '',
    currency: 'GHS',
    rentPrice: '',
    initialBillType: '',
    initialBillAmount: '',
  });

  const [message, setMessage] = useState<AppMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-dismiss messages after 6 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Derived State: Filter rooms based on the chosen compound
  const filteredRoomsForSelection = useMemo(() => {
    if (!selectedPropertyId) return [];
    return rooms.filter(
      room => room.property_id === selectedPropertyId && room.status === 'vacant'
    );
  }, [selectedPropertyId, rooms]);

  // Load directory list
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch the primary (parent) property matching the subdomain_slug
      const { data: primaryProperty, error: primaryError } = await supabase
        .from('properties')
        .select('id, title, host_id')
        .eq('subdomain_slug', subdomainSlug)
        .maybeSingle();

      if (primaryError) throw primaryError;
      if (!primaryProperty) {
        setProperties([]);
        setTenants([]);
        setRooms([]);
        return;
      }

      // 2. Fetch both the parent property AND any sub-properties/compounds belonging to it
      const { data: propertiesData, error: propError } = await supabase
        .from('properties')
        .select('id, title, host_id')
        .or(`id.eq.${primaryProperty.id},parent_property_id.eq.${primaryProperty.id}`);

      if (propError) throw propError;

      const mappedProperties: PropertySummary[] = (propertiesData || []).map(p => ({
        id: String(p.id),
        title: String(p.title),
        host_id: String(p.host_id)
      }));
      setProperties(mappedProperties);

      const propertyIds = mappedProperties.map(p => p.id);
      if (propertyIds.length === 0) {
        setTenants([]);
        setRooms([]);
        return;
      }

      // 3. Fetch apartments (rooms) linked to ALL of these retrieved properties
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, room_number, status, property_id, properties(id, title, host_id)')
        .in('property_id', propertyIds);

      if (roomsError) throw roomsError;

      const rawRooms = (roomsData || []) as unknown as RawRoomRecord[];
      const transformedRooms: DashboardRoomSummary[] = rawRooms.map((r) => ({
        id: String(r.id),
        room_number: String(r.room_number),
        status: String(r.status),
        property_id: String(r.property_id),
        properties: Array.isArray(r.properties)
          ? r.properties[0]
          : r.properties || undefined
      }));

      setRooms(transformedRooms);

      // 4. Fetch contracts matching active apartments
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          id,
          start_date,
          end_date,
          status,
          room_id,
          rooms (
            room_number,
            properties (
              id,
              title,
              host_id
            )
          ),
          tenant:profiles!tenant_id (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .in('room_id', transformedRooms.map(r => r.id))
        .eq('status', 'active');

      if (contractsError) throw contractsError;

      // 5. Fetch bills for payment calculation
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('room_id, tenant_id, status, due_date')
        .in('room_id', transformedRooms.map(r => r.id));

      if (billsError) throw billsError;

      const typedContracts = (contractsData || []) as DashboardContractQueryResult[];

      const mappedTenants: TenantDisplayModelExtended[] = typedContracts.map((contract) => {
        const associatedBills = (billsData || []).filter(
          b => b.room_id === contract.room_id && b.tenant_id === contract.tenant?.id
        );

        const hasUnpaid = associatedBills.some(b => b.status === 'unpaid' || b.status === 'pending');
        const isOverdue = associatedBills.some(b => {
          if (b.status === 'paid') return false;
          return new Date(b.due_date) < new Date();
        });

        const leaseEndDate = contract.end_date ? new Date(contract.end_date) : null;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const isExpiringSoon = leaseEndDate ? leaseEndDate <= thirtyDaysFromNow : false;

        let computedStatus: 'paid' | 'overdue' | 'expiring' = 'paid';
        if (isOverdue) {
          computedStatus = 'overdue';
        } else if (isExpiringSoon) {
          computedStatus = 'expiring';
        } else if (hasUnpaid) {
          computedStatus = 'paid';
        }

        return {
          id: contract.id,
          tenantId: contract.tenant?.id || '',
          roomId: contract.room_id || '',
          contractId: contract.id,
          firstName: contract.tenant?.first_name || 'Guest',
          lastName: contract.tenant?.last_name || 'User',
          email: contract.tenant?.email || 'no-email@compound.com',
          phone: contract.tenant?.phone_number || 'N/A',
          roomNumber: contract.rooms?.room_number || 'Unassigned',
          propertyName: contract.rooms?.properties?.title || 'Unknown Property',
          startDate: contract.start_date || '',
          endDate: contract.end_date || '',
          paymentStatus: computedStatus,
        };
      });

      setTenants(mappedTenants);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error loading directory:', err);
      setMessage({ type: 'error', text: `Sorry! something went wrong: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  }, [subdomainSlug, currentUser]);

  useEffect(() => {
    let isMounted = true;

    if (isInitialized) {
      if (currentUser) {
        Promise.resolve().then(() => {
          if (isMounted) {
            void fetchData();
          }
        });
      } else {
        Promise.resolve().then(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isInitialized, currentUser, fetchData]);

  // Persists payment status directly to Supabase
  const handleToggleStatus = async (tenant: TenantDisplayModelExtended) => {
    try {
      const targetStatus = tenant.paymentStatus === 'paid' ? 'unpaid' : 'paid';

      const { error } = await supabase
        .from('bills')
        .update({ status: targetStatus })
        .eq('room_id', tenant.roomId)
        .eq('tenant_id', tenant.tenantId);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Successfully updated all statements to: ${targetStatus}`
      });

      await fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setMessage({ type: 'error', text: `Failed to save update to Database: ${errorMessage}` });
    }
  };

  // Completely deletes a tenant, releases their apartment, and cleans up active contracts
  const handleDeleteTenant = async (tenant: TenantDisplayModelExtended) => {
    const confirmation = window.confirm(
      `Are you sure you want to remove ${tenant.firstName} ${tenant.lastName}? This will vacate Apt ${tenant.roomNumber} and cancel their active lease contract.`
    );
    if (!confirmation) return;

    try {
      setLoading(true);

      const { error: contractDeleteError } = await supabase
        .from('contracts')
        .delete()
        .eq('id', tenant.contractId);

      if (contractDeleteError) throw contractDeleteError;

      const { error: billsDeleteError } = await supabase
        .from('bills')
        .delete()
        .eq('room_id', tenant.roomId)
        .eq('tenant_id', tenant.tenantId);

      if (billsDeleteError) throw billsDeleteError;

      const { error: roomUpdateError } = await supabase
        .from('rooms')
        .update({ status: 'vacant' })
        .eq('id', tenant.roomId);

      if (roomUpdateError) throw roomUpdateError;

      await supabase.from('profiles').delete().eq('id', tenant.tenantId);

      setMessage({
        type: 'success',
        text: `Successfully removed ${tenant.firstName} ${tenant.lastName}. Apartment ${tenant.roomNumber} is now vacant.`
      });

      await fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(err);
      setMessage({ type: 'error', text: `Failed to remove tenant safely: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const selectedRoom = rooms.find(r => r.id === newTenant.roomId);
      if (!selectedRoom) {
        throw new Error('Please select a valid apartment room.');
      }

      const hostId = selectedRoom.properties?.host_id || currentUser?.id;
      if (!hostId) {
        throw new Error('Could not identify host configuration.');
      }

      const parsedRentPrice = parseFloat(newTenant.rentPrice);
      if (isNaN(parsedRentPrice) || parsedRentPrice <= 0) {
        throw new Error('Please enter a valid monthly rent amount.');
      }

      // 1. Generate auth credentials
      const tempPassword = Math.random().toString(36).slice(-10);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newTenant.email,
        password: tempPassword,
        options: {
          data: {
            first_name: newTenant.firstName,
            last_name: newTenant.lastName,
          }
        }
      });

      if (authError) throw authError;

      const profileId = authData.user?.id;
      if (!profileId) throw new Error('Could not initialize tenant user profile.');

      // 2. Build tenant profile container
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: profileId,
        first_name: newTenant.firstName,
        last_name: newTenant.lastName,
        email: newTenant.email,
        phone_number: newTenant.phone,
        role: 'tenant'
      });

      if (profileError) throw profileError;

      // 3. Update room defaults using explicit interface cast to allow custom 'currency' field
      const roomPayload: RoomUpdateRecord = {
        price_per_month: parsedRentPrice,
        currency: newTenant.currency,
        status: 'occupied'
      };

      const { error: roomUpdateError } = await (supabase.from('rooms') as unknown as {
        update: (values: RoomUpdateRecord) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
      }).update(roomPayload).eq('id', newTenant.roomId);

      if (roomUpdateError) throw roomUpdateError;

      // 4. Register active contract
      const { error: contractError } = await supabase.from('contracts').insert({
        room_id: newTenant.roomId,
        tenant_id: profileId,
        host_id: hostId,
        start_date: newTenant.startDate,
        end_date: newTenant.endDate,
        status: 'active'
      });

      if (contractError) throw contractError;

      // 5. Generate automated bills using explicit interface cast to allow custom 'currency' field
      const billsToInsert: BillInsertRecord[] = [];
      billsToInsert.push({
        room_id: newTenant.roomId,
        tenant_id: profileId,
        bill_type: 'Rent',
        amount: parsedRentPrice,
        currency: newTenant.currency,
        due_date: newTenant.startDate,
        is_recurring: true,
        status: 'pending'
      });

      if (newTenant.initialBillType && newTenant.initialBillAmount) {
        const parsedBillAmount = parseFloat(newTenant.initialBillAmount);
        if (!isNaN(parsedBillAmount) && parsedBillAmount > 0) {
          billsToInsert.push({
            room_id: newTenant.roomId,
            tenant_id: profileId,
            bill_type: newTenant.initialBillType,
            amount: parsedBillAmount,
            currency: newTenant.currency,
            due_date: newTenant.startDate,
            is_recurring: false,
            status: 'pending'
          });
        }
      }

      const { error: billsInsertError } = await (supabase.from('bills') as unknown as {
        insert: (values: BillInsertRecord[]) => Promise<{ error: { message: string } | null }>;
      }).insert(billsToInsert);

      if (billsInsertError) throw billsInsertError;

      setMessage({ type: 'success', text: 'Well done, the tenant has been successfully onboarded!' });
      setIsModalOpen(false);
      setSelectedPropertyId('');

      setNewTenant({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roomId: '',
        startDate: '',
        endDate: '',
        currency: 'GHS',
        rentPrice: '',
        initialBillType: '',
        initialBillAmount: ''
      });

      await fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(err);
      setMessage({ type: 'error', text: `Sorry! something went wrong: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-zinc-100">
      <TenantsPageHeader onAddTenantClick={() => setIsModalOpen(true)} />

      {message && (
        <MessageBanner message={message} onDismiss={() => setMessage(null)} />
      )}

      <TipBanner />

      <StatsOverview tenants={tenants} />

      <FilterBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TenantGrid
        loading={loading}
        tenants={filteredTenants}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteTenant}
      />

      <OnboardTenantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPropertyId('');
        }}
        properties={properties}
        filteredRooms={filteredRoomsForSelection}
        selectedPropertyId={selectedPropertyId}
        onSelectedPropertyIdChange={setSelectedPropertyId}
        newTenant={newTenant}
        onNewTenantChange={setNewTenant}
        onSubmit={handleOnboardTenant}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}