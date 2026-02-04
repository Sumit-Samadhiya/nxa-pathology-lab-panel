// Sample Collection Module Types

// Enums
export type CollectionStatus = 
  | 'Pending' 
  | 'Collected' 
  | 'Rejected' 
  | 'InProgress' 
  | 'QualityIssue';

export type SampleQuality = 
  | 'Good' 
  | 'Hemolyzed' 
  | 'Clotted' 
  | 'Insufficient' 
  | 'Lipemic' 
  | 'Contaminated';

export type TubeType = 
  | 'EDTA' 
  | 'Plain' 
  | 'SodiumCitrate' 
  | 'Fluoride' 
  | 'Gel';

export type HomeCollectionStatus = 
  | 'PendingAssignment' 
  | 'Assigned' 
  | 'InProgress' 
  | 'Collected' 
  | 'Cancelled';

export type CollectionMethod = 
  | 'Random' 
  | 'Midstream' 
  | '24Hour';

export type PatientCondition = 
  | 'Normal' 
  | 'Anxious' 
  | 'DifficultVeinAccess' 
  | 'Other';

export type CollectionSite = 
  | 'LeftArm' 
  | 'RightArm' 
  | 'Hand' 
  | 'Other';

export type Department = 
  | 'Hematology' 
  | 'Biochemistry' 
  | 'Microbiology' 
  | 'Serology';

export type PriorityLevel = 
  | 'Normal' 
  | 'Urgent' 
  | 'STAT';

export type BookingType = 
  | 'WalkIn' 
  | 'Scheduled';

export type RejectionReason = 
  | 'NotFasting' 
  | 'InsufficientID' 
  | 'PatientRefused' 
  | 'MedicalContraindication' 
  | 'Other';

export type TimeSlot = 
  | '6-9 AM' 
  | '9-12 PM' 
  | '12-3 PM' 
  | '3-6 PM';

// Interfaces
export interface Collector {
  id: string;
  name: string;
  staffID: string;
  mobile: string;
  currentAssignments: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  availability: 'Free' | 'Busy';
  email?: string;
  photo?: string;
}

export interface Test {
  id: string;
  testCode: string;
  testName: string;
  sampleType: string;
  sampleVolume: number; // in ml
  containerType: string;
  tubeType?: TubeType;
  fastingRequired: boolean;
  reportTime: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  patientID: string;
  email?: string;
  address?: string;
  photo?: string;
}

export interface SampleRequirement {
  sampleType: string;
  volume: number;
  tubeType: TubeType | string;
  containerType: string;
  count: number;
  testNames: string[];
}

export interface SampleDetail {
  id: string;
  sampleType: string;
  tubeType: string;
  numberOfTubes: number;
  volumeCollected: number;
  quality: SampleQuality;
  qualityNotes?: string;
  collectionMethod?: CollectionMethod;
}

export interface CollectionFormData {
  collectorID: string;
  collectorName: string;
  collectionDate: string;
  collectionTime: string;
  samples: SampleDetail[];
  fastingStatus: 'Fasting' | 'NonFasting' | 'NotApplicable';
  fastingHours?: number;
  patientCondition: PatientCondition;
  patientConditionNotes?: string;
  collectionSite?: CollectionSite;
  collectionNotes?: string;
  printLabels: boolean;
  numberOfLabels: number;
  qualityChecklist: {
    patientVerified: boolean;
    correctTube: boolean;
    adequateVolume: boolean;
    labelApplied: boolean;
    storedProperly: boolean;
    patientInformed: boolean;
  };
  department: Department;
  priority: PriorityLevel;
  priorityReason?: string;
}

export interface Collection {
  id: string;
  tokenNumber: string;
  sampleID: string;
  bookingID: string;
  patient: Patient;
  tests: Test[];
  bookingType: BookingType;
  bookingTime: string;
  bookingDate: string;
  status: CollectionStatus;
  priority: PriorityLevel;
  waitingTime?: number; // in minutes
  sampleRequirements: SampleRequirement[];
  specialInstructions?: string;
  collectionData?: CollectionFormData;
  collectedAt?: string;
  collectedBy?: string;
  rejectionReason?: string;
  qualityIssues?: QualityIssue[];
  type: 'Lab' | 'Home';
}

export interface HomeCollection extends Collection {
  address: string;
  area: string;
  locality: string;
  preferredDate: string;
  preferredTimeSlot: TimeSlot;
  assignedCollector?: Collector;
  homeCollectionStatus: HomeCollectionStatus;
  distance?: number; // km from lab
  latitude?: number;
  longitude?: number;
  scheduledTime?: string;
  collectionProof?: CollectionProof;
}

export interface CollectionProof {
  samplePhotos: string[]; // URLs
  patientSignature?: string; // Base64 or URL
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  idProof?: string; // URL
  collectionConfirmed: boolean;
  paymentCollected?: boolean;
  paymentAmount?: number;
  receiptNumber?: string;
  timestamp: string;
}

export interface QualityIssue {
  id: string;
  sampleID: string;
  tokenNumber: string;
  patientName: string;
  issueType: SampleQuality;
  description: string;
  collectedBy: string;
  reportedBy: string;
  reportedAt: string;
  actionTaken?: string;
  status: 'Open' | 'ReCollectionRequested' | 'AcceptedWithDisclaimer' | 'Cancelled';
}

export interface RouteStop {
  id: string;
  sequence: number;
  collection: HomeCollection;
  estimatedTime: string;
  estimatedDuration: number; // minutes
  distance: number; // km from previous stop
}

export interface Route {
  id: string;
  date: string;
  collector: Collector;
  area: string[];
  stops: RouteStop[];
  totalDistance: number; // km
  totalDuration: number; // hours
  startTime: string;
  endTime: string;
  status: 'Planned' | 'InProgress' | 'Completed';
}

export interface CollectionStatistics {
  pendingCollections: number;
  todaysCollections: number;
  homeCollectionsPending: number;
  qualityIssues: number;
  overdue: number;
  rejectedToday: number;
  averageCollectionTime: number; // minutes
  collectorPerformance: CollectorPerformance[];
}

export interface CollectorPerformance {
  collector: Collector;
  totalCollections: number;
  averageTime: number; // minutes
  qualityIssuesCount: number;
  successRate: number; // percentage
}

export interface ValidationErrors {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AssignCollectorData {
  collectionID: string;
  collectorID: string;
  scheduledTime: string;
  estimatedDuration: number;
  specialInstructions?: string;
  notifyCollector: boolean;
  notifyPatient: boolean;
}

export interface BatchCollectionData {
  collections: Collection[];
  collectorID: string;
  collectionTime: string;
}

export interface SampleLabel {
  sampleID: string;
  patientName: string;
  testNames: string;
  collectionDate: string;
  collectionTime: string;
  collectorName: string;
  barcode: string;
}

// Constants
export const TUBE_TYPES: Record<TubeType, { label: string; color: string }> = {
  EDTA: { label: 'EDTA Tube (Purple Cap)', color: '#9C27B0' },
  Plain: { label: 'Plain Tube (Red Cap)', color: '#F44336' },
  SodiumCitrate: { label: 'Sodium Citrate Tube (Blue Cap)', color: '#2196F3' },
  Fluoride: { label: 'Fluoride Tube (Gray Cap)', color: '#9E9E9E' },
  Gel: { label: 'Gel Tube (Yellow Cap)', color: '#FFEB3B' },
};

export const SAMPLE_QUALITY_OPTIONS: Record<SampleQuality, { label: string; icon: string; color: string }> = {
  Good: { label: '✅ Good', icon: '✅', color: '#4CAF50' },
  Hemolyzed: { label: '⚠️ Hemolyzed', icon: '⚠️', color: '#FF9800' },
  Clotted: { label: '⚠️ Clotted', icon: '⚠️', color: '#FF9800' },
  Insufficient: { label: '⚠️ Insufficient Volume', icon: '⚠️', color: '#FF9800' },
  Lipemic: { label: '❌ Lipemic', icon: '❌', color: '#F44336' },
  Contaminated: { label: '❌ Contaminated', icon: '❌', color: '#F44336' },
};

export const STATUS_COLORS: Record<CollectionStatus, string> = {
  Pending: '#FF9800',
  Collected: '#4CAF50',
  Rejected: '#F44336',
  InProgress: '#2196F3',
  QualityIssue: '#FF5722',
};

export const HOME_COLLECTION_STATUS_COLORS: Record<HomeCollectionStatus, string> = {
  PendingAssignment: '#FFC107',
  Assigned: '#2196F3',
  InProgress: '#FF9800',
  Collected: '#4CAF50',
  Cancelled: '#F44336',
};

export const TIME_SLOTS: TimeSlot[] = ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM'];

export const DEPARTMENTS: Department[] = ['Hematology', 'Biochemistry', 'Microbiology', 'Serology'];

export const REJECTION_REASONS: RejectionReason[] = [
  'NotFasting',
  'InsufficientID',
  'PatientRefused',
  'MedicalContraindication',
  'Other',
];

export const COLLECTION_SITES: CollectionSite[] = ['LeftArm', 'RightArm', 'Hand', 'Other'];

export const PATIENT_CONDITIONS: PatientCondition[] = ['Normal', 'Anxious', 'DifficultVeinAccess', 'Other'];
