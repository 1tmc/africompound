export type DashboardPaymentStatus = 'paid' | 'overdue' | 'expiring';

export interface DashboardProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
  phone_number?: string | null;
  role?: string | null;
}

export interface DashboardPropertySummary {
  id: string;
  title: string | null;
  host_id?: string | null;
  location?: string | null;
  subdomain_slug?: string | null;
}

export interface DashboardRoomSummary {
  id: string;
  room_number: string;
  status: string;
  property_id: string;
  price_per_month?: number | null;
  properties?: DashboardPropertySummary | null;
}

export interface DashboardContractQueryResult {
  id: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  room_id: string | null;
  rooms: {
    room_number: string;
    properties: DashboardPropertySummary | null;
  } | null;
  tenant: DashboardProfile | null;
}

export interface DashboardTenantDisplayModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roomNumber: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  paymentStatus: DashboardPaymentStatus;
}

export interface DashboardBill {
  id: string;
  room_id: string;
  tenant_id: string;
  bill_type: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'unpaid';
  created_at: string;
  rooms: {
    room_number: string;
    price_per_month: number;
    properties: DashboardPropertySummary | null;
  } | null;
  tenant_profile: DashboardProfile | null;
}

export interface DashboardPaymentNotification {
  id: string;
  amount: number;
  payment_type: string;
  created_at: string;
  status: 'pending' | 'acknowledged';
  tenant_profile?: DashboardProfile;
  rooms?: { room_number: string };
}

export interface DashboardProperty {
  id: string;
  title: string;
  location: string;
  subdomain_slug: string;
  rules?: string;
  host_id?: string;
}

export interface DashboardFormState {
  type: 'success' | 'error';
  msg: string;
}
