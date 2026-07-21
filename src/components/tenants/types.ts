import type { DashboardTenantDisplayModel } from '@/types/dashboard';

export interface AppMessage {
  type: 'success' | 'error';
  text: string;
}

export interface PropertySummary {
  id: string;
  title: string;
  host_id: string;
}

// Extend the display model to hold database ids needed for deletion and updating
export interface TenantDisplayModelExtended extends DashboardTenantDisplayModel {
  tenantId: string;
  roomId: string;
  contractId: string;
}

export interface NewTenantFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roomId: string;
  startDate: string;
  endDate: string;
  currency: string;
  rentPrice: string;
  initialBillType: string;
  initialBillAmount: string;
}

export type StatusFilter = 'all' | 'paid' | 'overdue' | 'expiring';
