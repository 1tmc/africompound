// src/types/billing.ts

export interface DatabaseProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

export interface DatabaseProperty {
  id: string;
  title: string | null;
}

export interface DatabaseRoom {
  id: string;
  room_number: string;
  price_per_month: number;
  status?: string;
  property_id?: string;

  properties?: DatabaseProperty | null;
}

export interface DatabaseBill {
  id: string;

  room_id: string;
  tenant_id: string;

  bill_type: string;
  amount: number;

  due_date: string;
  created_at?: string;

  is_recurring: boolean;

  status: 'paid' | 'unpaid';

  rooms?: {
    room_number: string;
  } | null;

  tenant_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface DatabaseNotification {
  id: string;

  tenant_id: string;
  room_id: string;
  bill_id: string | null;

  amount: number;
  payment_type: string;

  status: 'pending' | 'acknowledged';

  created_at: string;

  rooms?: {
    room_number: string;
  } | null;

  tenant_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface BillPayload {
  roomIds: string[];

  billType: string;

  amountGHS: number;

  dueDate: string;

  isRecurring: boolean;
}