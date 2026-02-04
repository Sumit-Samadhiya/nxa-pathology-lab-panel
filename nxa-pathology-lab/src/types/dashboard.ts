// Dashboard Statistics Interface
export interface DashboardStats {
  todaysBookings: number;
  walkInPatients: number;
  pendingSamples: number;
  pendingReports: number;
  todaysRevenue: number;
}

// Appointment Interface
export interface Appointment {
  id: string;
  token: string;
  patientName: string;
  testName: string;
  time: string;
  status: 'Booked' | 'Collected' | 'Testing' | 'Ready';
}

// Home Collection Interface
export interface HomeCollection {
  id: string;
  token: string;
  patientName: string;
  address: string;
  scheduledTime: string;
  collectorName: string | null;
  status: 'Pending' | 'Assigned' | 'Collected';
}

// Filter types
export type HomeCollectionFilter = 'All' | 'Pending' | 'Assigned' | 'Collected';
