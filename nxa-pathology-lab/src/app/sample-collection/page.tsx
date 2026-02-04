'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  FormGroup,
  RadioGroup,
  Radio,
  Tooltip,
  Badge,
  Fab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Autocomplete,
  Avatar,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Close as CloseIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Place as PlaceIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
  CameraAlt as CameraAltIcon,
  MyLocation as MyLocationIcon,
  Route as RouteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Collection,
  HomeCollection,
  Collector,
  CollectionFormData,
  SampleDetail,
  QualityIssue,
  SampleQuality,
  CollectionStatus,
  HomeCollectionStatus,
  Department,
  TubeType,
  PatientCondition,
  CollectionSite,
  RouteStop,
  AssignCollectorData,
  TUBE_TYPES,
  SAMPLE_QUALITY_OPTIONS,
  STATUS_COLORS,
  HOME_COLLECTION_STATUS_COLORS,
  TIME_SLOTS,
  DEPARTMENTS,
} from '@/types/collection';
import {
  calculateWaitingTime,
  calculateWaitingMinutes,
  getSampleRequirements,
  generateCollectionSMS,
  generateCollectorSMS,
  formatAddress,
  formatTime,
  formatDate,
  formatDateTime,
  isOverdue,
  isUrgent,
  getDepartmentForTests,
  getReportReadyTime,
  getGoogleMapsUrl,
  optimizeRoute,
  calculateRouteDistance,
  groupByArea,
  getUniqueAreas,
  generateBarcodeData,
} from '@/utils/collectionHelpers';
import {
  validateCollectionForm,
  validateCollectorAssignment,
  validateQualityChecklist,
} from '@/utils/collectionValidation';

// Dummy data generation functions
function getDummyCollectors(): Collector[] {
  return [
    {
      id: 'COL001',
      name: 'Rajesh Kumar',
      staffID: 'ST1001',
      mobile: '9876543210',
      currentAssignments: 3,
      availability: 'Busy',
      email: 'rajesh@lab.com',
    },
    {
      id: 'COL002',
      name: 'Priya Sharma',
      staffID: 'ST1002',
      mobile: '9876543211',
      currentAssignments: 1,
      availability: 'Free',
      email: 'priya@lab.com',
    },
    {
      id: 'COL003',
      name: 'Amit Patel',
      staffID: 'ST1003',
      mobile: '9876543212',
      currentAssignments: 0,
      availability: 'Free',
      email: 'amit@lab.com',
    },
    {
      id: 'COL004',
      name: 'Sneha Reddy',
      staffID: 'ST1004',
      mobile: '9876543213',
      currentAssignments: 2,
      availability: 'Free',
      email: 'sneha@lab.com',
    },
    {
      id: 'COL005',
      name: 'Vikram Singh',
      staffID: 'ST1005',
      mobile: '9876543214',
      currentAssignments: 4,
      availability: 'Busy',
      email: 'vikram@lab.com',
    },
  ];
}

function getDummyPendingCollections(): Collection[] {
  const collections: Collection[] = [];
  const now = new Date();

  // Sample 1: Overdue
  collections.push({
    id: 'C001',
    tokenNumber: 'T-2024-001',
    sampleID: 'S-2024-001',
    bookingID: 'B-001',
    patient: {
      id: 'P001',
      name: 'Ramesh Kumar',
      age: 45,
      gender: 'Male',
      mobile: '9876543201',
      patientID: 'PID001',
    },
    tests: [
      {
        id: 'TEST001',
        testCode: 'CBC',
        testName: 'Complete Blood Count',
        sampleType: 'Blood',
        sampleVolume: 2,
        containerType: 'EDTA Tube',
        tubeType: 'EDTA',
        fastingRequired: false,
        reportTime: '24 hours',
      },
    ],
    bookingType: 'WalkIn',
    bookingTime: new Date(now.getTime() - 45 * 60000).toISOString(),
    bookingDate: format(now, 'yyyy-MM-dd'),
    status: 'Pending',
    priority: 'Normal',
    sampleRequirements: [],
    type: 'Lab',
  });

  // Sample 2: Urgent
  collections.push({
    id: 'C002',
    tokenNumber: 'T-2024-002',
    sampleID: 'S-2024-002',
    bookingID: 'B-002',
    patient: {
      id: 'P002',
      name: 'Priya Sharma',
      age: 32,
      gender: 'Female',
      mobile: '9876543202',
      patientID: 'PID002',
    },
    tests: [
      {
        id: 'TEST002',
        testCode: 'GLUC',
        testName: 'Fasting Blood Sugar',
        sampleType: 'Blood',
        sampleVolume: 1,
        containerType: 'Fluoride Tube',
        tubeType: 'Fluoride',
        fastingRequired: true,
        reportTime: '4 hours',
      },
      {
        id: 'TEST003',
        testCode: 'HBA1C',
        testName: 'HbA1c',
        sampleType: 'Blood',
        sampleVolume: 2,
        containerType: 'EDTA Tube',
        tubeType: 'EDTA',
        fastingRequired: false,
        reportTime: '24 hours',
      },
    ],
    bookingType: 'Scheduled',
    bookingTime: new Date(now.getTime() - 20 * 60000).toISOString(),
    bookingDate: format(now, 'yyyy-MM-dd'),
    status: 'Pending',
    priority: 'Urgent',
    specialInstructions: 'Patient is fasting for 12 hours',
    sampleRequirements: [],
    type: 'Lab',
  });

  // Sample 3: Normal
  collections.push({
    id: 'C003',
    tokenNumber: 'T-2024-003',
    sampleID: 'S-2024-003',
    bookingID: 'B-003',
    patient: {
      id: 'P003',
      name: 'Amit Patel',
      age: 28,
      gender: 'Male',
      mobile: '9876543203',
      patientID: 'PID003',
    },
    tests: [
      {
        id: 'TEST004',
        testCode: 'LFT',
        testName: 'Liver Function Test',
        sampleType: 'Blood',
        sampleVolume: 3,
        containerType: 'Gel Tube',
        tubeType: 'Gel',
        fastingRequired: true,
        reportTime: '24 hours',
      },
    ],
    bookingType: 'WalkIn',
    bookingTime: new Date(now.getTime() - 10 * 60000).toISOString(),
    bookingDate: format(now, 'yyyy-MM-dd'),
    status: 'Pending',
    priority: 'Normal',
    sampleRequirements: [],
    type: 'Lab',
  });

  // Add more dummy collections
  for (let i = 4; i <= 30; i++) {
    const bookingMinutesAgo = Math.floor(Math.random() * 60) + 5;
    collections.push({
      id: `C${String(i).padStart(3, '0')}`,
      tokenNumber: `T-2024-${String(i).padStart(3, '0')}`,
      sampleID: `S-2024-${String(i).padStart(3, '0')}`,
      bookingID: `B-${String(i).padStart(3, '0')}`,
      patient: {
        id: `P${String(i).padStart(3, '0')}`,
        name: `Patient ${i}`,
        age: Math.floor(Math.random() * 60) + 20,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        mobile: `98765432${String(i).padStart(2, '0')}`,
        patientID: `PID${String(i).padStart(3, '0')}`,
      },
      tests: [
        {
          id: `TEST${String(i).padStart(3, '0')}`,
          testCode: ['CBC', 'GLUC', 'LFT', 'KFT', 'LIPID'][i % 5],
          testName: ['Complete Blood Count', 'Blood Sugar', 'Liver Function Test', 'Kidney Function Test', 'Lipid Profile'][i % 5],
          sampleType: 'Blood',
          sampleVolume: 2,
          containerType: 'EDTA Tube',
          tubeType: 'EDTA',
          fastingRequired: i % 3 === 0,
          reportTime: '24 hours',
        },
      ],
      bookingType: i % 2 === 0 ? 'WalkIn' : 'Scheduled',
      bookingTime: new Date(now.getTime() - bookingMinutesAgo * 60000).toISOString(),
      bookingDate: format(now, 'yyyy-MM-dd'),
      status: 'Pending',
      priority: i % 10 === 0 ? 'Urgent' : 'Normal',
      sampleRequirements: [],
      type: 'Lab',
    });
  }

  return collections;
}

function getDummyHomeCollections(): HomeCollection[] {
  const collections: HomeCollection[] = [];
  const now = new Date();

  const areas = ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Marathahalli'];
  const addresses = [
    '#123, 1st Cross, 5th Block',
    'Flat 402, Green Apartments',
    'House No. 567, 2nd Main',
    '#89, Villa Gardens',
    'Plot 234, Sector 4',
  ];

  for (let i = 1; i <= 15; i++) {
    const area = areas[i % areas.length];
    const address = addresses[i % addresses.length];
    const status: HomeCollectionStatus = 
      i <= 3 ? 'PendingAssignment' : 
      i <= 6 ? 'Assigned' : 
      i <= 9 ? 'InProgress' : 
      i <= 12 ? 'Collected' : 
      'Cancelled';

    collections.push({
      id: `HC${String(i).padStart(3, '0')}`,
      tokenNumber: `HT-2024-${String(i).padStart(3, '0')}`,
      sampleID: `HS-2024-${String(i).padStart(3, '0')}`,
      bookingID: `HB-${String(i).padStart(3, '0')}`,
      patient: {
        id: `HP${String(i).padStart(3, '0')}`,
        name: `Home Patient ${i}`,
        age: Math.floor(Math.random() * 60) + 20,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        mobile: `98765432${String(i + 50).padStart(2, '0')}`,
        patientID: `HPID${String(i).padStart(3, '0')}`,
        address: `${address}, ${area}`,
      },
      tests: [
        {
          id: `HTEST${String(i).padStart(3, '0')}`,
          testCode: ['CBC', 'GLUC', 'LFT'][i % 3],
          testName: ['Complete Blood Count', 'Blood Sugar', 'Liver Function Test'][i % 3],
          sampleType: 'Blood',
          sampleVolume: 2,
          containerType: 'EDTA Tube',
          tubeType: 'EDTA',
          fastingRequired: i % 2 === 0,
          reportTime: '24 hours',
        },
      ],
      bookingType: 'Scheduled',
      bookingTime: new Date(now.getTime() + i * 3600000).toISOString(),
      bookingDate: format(new Date(now.getTime() + i * 86400000), 'yyyy-MM-dd'),
      status: 'Pending',
      priority: 'Normal',
      sampleRequirements: [],
      type: 'Home',
      address: `${address}, ${area}`,
      area,
      locality: area,
      preferredDate: format(new Date(now.getTime() + i * 86400000), 'yyyy-MM-dd'),
      preferredTimeSlot: TIME_SLOTS[i % TIME_SLOTS.length],
      homeCollectionStatus: status,
      distance: Math.floor(Math.random() * 15) + 2,
      latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
    });
  }

  return collections;
}

function getDummyCollectedSamples(): Collection[] {
  const collections: Collection[] = [];
  const now = new Date();

  for (let i = 1; i <= 48; i++) {
    const collectedMinutesAgo = Math.floor(Math.random() * 240) + 10;
    collections.push({
      id: `COL${String(i).padStart(3, '0')}`,
      tokenNumber: `T-2024-${String(i + 100).padStart(3, '0')}`,
      sampleID: `S-2024-${String(i + 100).padStart(3, '0')}`,
      bookingID: `B-${String(i + 100).padStart(3, '0')}`,
      patient: {
        id: `P${String(i + 100).padStart(3, '0')}`,
        name: `Collected Patient ${i}`,
        age: Math.floor(Math.random() * 60) + 20,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        mobile: `98765433${String(i).padStart(2, '0')}`,
        patientID: `PID${String(i + 100).padStart(3, '0')}`,
      },
      tests: [
        {
          id: `TEST${String(i + 100).padStart(3, '0')}`,
          testCode: ['CBC', 'GLUC', 'LFT', 'KFT'][i % 4],
          testName: ['Complete Blood Count', 'Blood Sugar', 'Liver Function Test', 'Kidney Function Test'][i % 4],
          sampleType: 'Blood',
          sampleVolume: 2,
          containerType: 'EDTA Tube',
          tubeType: 'EDTA',
          fastingRequired: i % 2 === 0,
          reportTime: '24 hours',
        },
      ],
      bookingType: i % 2 === 0 ? 'WalkIn' : 'Scheduled',
      bookingTime: new Date(now.getTime() - (collectedMinutesAgo + 30) * 60000).toISOString(),
      bookingDate: format(now, 'yyyy-MM-dd'),
      status: 'Collected',
      priority: 'Normal',
      sampleRequirements: [],
      type: 'Lab',
      collectedAt: new Date(now.getTime() - collectedMinutesAgo * 60000).toISOString(),
      collectedBy: getDummyCollectors()[i % 5].name,
    });
  }

  return collections;
}

function getDummyQualityIssues(): QualityIssue[] {
  return [
    {
      id: 'QI001',
      sampleID: 'S-2024-045',
      tokenNumber: 'T-2024-045',
      patientName: 'Suresh Kumar',
      issueType: 'Hemolyzed',
      description: 'Sample appears hemolyzed, possibly due to difficult venipuncture',
      collectedBy: 'Rajesh Kumar',
      reportedBy: 'Lab Supervisor',
      reportedAt: new Date().toISOString(),
      status: 'Open',
    },
    {
      id: 'QI002',
      sampleID: 'S-2024-067',
      tokenNumber: 'T-2024-067',
      patientName: 'Anjali Verma',
      issueType: 'Insufficient',
      description: 'Insufficient sample volume for all requested tests',
      collectedBy: 'Priya Sharma',
      reportedBy: 'Testing Department',
      reportedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'ReCollectionRequested',
    },
  ];
}

export default function SampleCollectionPage() {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [pendingCollections, setPendingCollections] = useState<Collection[]>([]);
  const [homeCollections, setHomeCollections] = useState<HomeCollection[]>([]);
  const [collectedSamples, setCollectedSamples] = useState<Collection[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>([]);

  // Dialog states
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [batchCollectionDialogOpen, setBatchCollectionDialogOpen] = useState(false);
  const [assignCollectorDialogOpen, setAssignCollectorDialogOpen] = useState(false);
  const [routePlanningDialogOpen, setRoutePlanningDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const [qualityIssuesDialogOpen, setQualityIssuesDialogOpen] = useState(false);
  const [collectedViewDialogOpen, setCollectedViewDialogOpen] = useState(false);

  // Selected data
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedHomeCollection, setSelectedHomeCollection] = useState<HomeCollection | null>(null);
  const [bulkSelected, setBulkSelected] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

  // Collection form data
  const [collectionFormData, setCollectionFormData] = useState<CollectionFormData>({
    collectorID: '',
    collectorName: '',
    collectionDate: format(new Date(), 'yyyy-MM-dd'),
    collectionTime: format(new Date(), 'HH:mm'),
    samples: [],
    fastingStatus: 'NotApplicable',
    patientCondition: 'Normal',
    printLabels: true,
    numberOfLabels: 1,
    qualityChecklist: {
      patientVerified: false,
      correctTube: false,
      adequateVolume: false,
      labelApplied: false,
      storedProperly: false,
      patientInformed: false,
    },
    department: 'Hematology',
    priority: 'Normal',
  });

  // Filters
  const [labFilters, setLabFilters] = useState({
    search: '',
    status: 'All',
    type: 'All',
    time: 'All',
    sort: 'Time',
  });

  const [homeFilters, setHomeFilters] = useState({
    search: '',
    status: 'All',
    date: 'All',
    area: 'All',
    collector: 'All',
  });

  // Assign collector data
  const [assignData, setAssignData] = useState<Partial<AssignCollectorData>>({
    collectorID: '',
    scheduledTime: '',
    estimatedDuration: 30,
    specialInstructions: '',
    notifyCollector: true,
    notifyPatient: true,
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Statistics
  const [stats, setStats] = useState({
    pendingCollections: 15,
    todaysCollections: 48,
    homePending: 8,
    qualityIssues: 2,
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setPendingCollections(getDummyPendingCollections());
    setHomeCollections(getDummyHomeCollections());
    setCollectedSamples(getDummyCollectedSamples());
    setCollectors(getDummyCollectors());
    setQualityIssues(getDummyQualityIssues());
    updateStatistics();
  };

  const refreshData = () => {
    // Simulate data refresh
    updateStatistics();
  };

  const updateStatistics = () => {
    const pending = pendingCollections.filter(c => c.status === 'Pending').length;
    const homePending = homeCollections.filter(c => c.homeCollectionStatus === 'PendingAssignment').length;
    setStats({
      pendingCollections: pending,
      todaysCollections: collectedSamples.length,
      homePending,
      qualityIssues: qualityIssues.length,
    });
  };

  // Collection Dialog Handlers
  const handleCollectNow = (collection: Collection) => {
    setSelectedCollection(collection);
    
    // Initialize form with sample requirements
    const requirements = getSampleRequirements(collection.tests);
    const samples: SampleDetail[] = requirements.map((req, index) => ({
      id: `sample-${index}`,
      sampleType: req.sampleType,
      tubeType: req.tubeType,
      numberOfTubes: req.count,
      volumeCollected: req.volume,
      quality: 'Good',
    }));

    setCollectionFormData({
      ...collectionFormData,
      samples,
      fastingStatus: collection.tests.some(t => t.fastingRequired) ? 'NotApplicable' : 'NotApplicable',
      department: getDepartmentForTests(collection.tests),
      numberOfLabels: samples.length,
    });

    setCollectionDialogOpen(true);
  };

  const handleSubmitCollection = () => {
    // Validate form
    const validation = validateCollectionForm(collectionFormData);
    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    // Check quality checklist
    if (!validateQualityChecklist(collectionFormData.qualityChecklist)) {
      setSnackbar({
        open: true,
        message: 'Please complete the quality checklist',
        severity: 'error',
      });
      return;
    }

    // Update collection status
    if (selectedCollection) {
      const updatedCollection = {
        ...selectedCollection,
        status: 'Collected' as CollectionStatus,
        collectedAt: new Date().toISOString(),
        collectedBy: collectionFormData.collectorName,
        collectionData: collectionFormData,
      };

      // Remove from pending and add to collected
      setPendingCollections(prev => prev.filter(c => c.id !== selectedCollection.id));
      setCollectedSamples(prev => [updatedCollection, ...prev]);

      // Send SMS
      const smsMessage = generateCollectionSMS({
        patientName: selectedCollection.patient.name,
        sampleID: selectedCollection.sampleID,
        reportTime: getReportReadyTime(selectedCollection.tests),
      });

      // Print labels if requested
      if (collectionFormData.printLabels) {
        console.log('Printing labels...');
      }

      setSnackbar({
        open: true,
        message: 'Sample collected successfully!',
        severity: 'success',
      });

      setCollectionDialogOpen(false);
      updateStatistics();
    }
  };

  // Assign Collector Handler
  const handleAssignCollector = () => {
    if (!selectedHomeCollection || !assignData.collectorID || !assignData.scheduledTime) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    const selectedCollector = collectors.find(c => c.id === assignData.collectorID);
    if (!selectedCollector) return;

    // Update home collection
    const updated = homeCollections.map(hc => {
      if (hc.id === selectedHomeCollection.id) {
        return {
          ...hc,
          homeCollectionStatus: 'Assigned' as HomeCollectionStatus,
          assignedCollector: selectedCollector,
          scheduledTime: assignData.scheduledTime,
        };
      }
      return hc;
    });

    setHomeCollections(updated);

    // Send SMS notifications
    if (assignData.notifyPatient) {
      const patientSMS = `Home collection scheduled for ${formatDate(assignData.scheduledTime!)} at ${formatTime(assignData.scheduledTime!)}. Collector: ${selectedCollector.name}, Mobile: ${selectedCollector.mobile}`;
      console.log('SMS to patient:', patientSMS);
    }

    if (assignData.notifyCollector) {
      const collectorSMS = generateCollectorSMS({
        collectorName: selectedCollector.name,
        patientName: selectedHomeCollection.patient.name,
        address: selectedHomeCollection.address,
        time: formatTime(assignData.scheduledTime!),
        mobile: selectedHomeCollection.patient.mobile,
      });
      console.log('SMS to collector:', collectorSMS);
    }

    setSnackbar({
      open: true,
      message: 'Collector assigned successfully!',
      severity: 'success',
    });

    setAssignCollectorDialogOpen(false);
    updateStatistics();
  };

  // Lab Collection DataGrid Columns
  const labCollectionColumns: GridColDef[] = [
    {
      field: 'priority',
      headerName: 'Priority',
      width: 80,
      renderCell: (params) => (
        params.row.priority === 'Urgent' || params.row.priority === 'STAT' ? (
          <Tooltip title="Urgent">
            <WarningIcon color="error" />
          </Tooltip>
        ) : null
      ),
    },
    {
      field: 'tokenNumber',
      headerName: 'Token',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.row.tokenNumber}
        </Typography>
      ),
    },
    {
      field: 'sampleID',
      headerName: 'Sample ID',
      width: 130,
    },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      width: 150,
      valueGetter: (value, row) => row.patient.name,
    },
    {
      field: 'ageGender',
      headerName: 'Age / Gender',
      width: 120,
      valueGetter: (value, row) => `${row.patient.age} / ${row.patient.gender.charAt(0)}`,
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      width: 120,
      valueGetter: (value, row) => row.patient.mobile,
    },
    {
      field: 'tests',
      headerName: 'Tests',
      width: 180,
      renderCell: (params) => {
        const testNames = params.row.tests.map((t: any) => t.testName).join(', ');
        return (
          <Tooltip title={testNames}>
            <Typography variant="body2" noWrap>
              {testNames}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'sampleType',
      headerName: 'Sample Type',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.row.tests[0].sampleType} size="small" color="primary" />
      ),
    },
    {
      field: 'bookingTime',
      headerName: 'Booking Time',
      width: 100,
      valueGetter: (value, row) => formatTime(row.bookingTime),
    },
    {
      field: 'waitingTime',
      headerName: 'Waiting Time',
      width: 120,
      renderCell: (params) => {
        const waitTime = calculateWaitingTime(params.row.bookingTime);
        const isOverdueStatus = isOverdue(params.row.bookingTime);
        return (
          <Typography
            variant="body2"
            color={isOverdueStatus ? 'error' : 'textPrimary'}
            fontWeight={isOverdueStatus ? 'bold' : 'normal'}
          >
            {waitTime}
          </Typography>
        );
      },
    },
    {
      field: 'bookingType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.bookingType === 'WalkIn' ? 'Walk-in' : 'Scheduled'}
          size="small"
          color={params.row.bookingType === 'WalkIn' ? 'default' : 'info'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          size="small"
          sx={{ bgcolor: STATUS_COLORS[params.row.status as CollectionStatus], color: 'white' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => handleCollectNow(params.row)}
          >
            Collect
          </Button>
          <Tooltip title="Call Patient">
            <IconButton size="small" color="primary" href={`tel:${params.row.patient.mobile}`}>
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Home Collection DataGrid Columns
  const homeCollectionColumns: GridColDef[] = [
    {
      field: 'tokenNumber',
      headerName: 'Token',
      width: 130,
    },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      width: 150,
      valueGetter: (value, row) => row.patient.name,
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      width: 120,
      valueGetter: (value, row) => row.patient.mobile,
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.row.address}>
          <Typography variant="body2" noWrap>
            {params.row.address}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'area',
      headerName: 'Area',
      width: 120,
    },
    {
      field: 'tests',
      headerName: 'Tests',
      width: 150,
      renderCell: (params) => {
        const testNames = params.row.tests.map((t: any) => t.testName).join(', ');
        return (
          <Tooltip title={testNames}>
            <Typography variant="body2" noWrap>
              {testNames}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'preferredDate',
      headerName: 'Preferred Date',
      width: 120,
      valueGetter: (value, row) => formatDate(row.preferredDate),
    },
    {
      field: 'preferredTimeSlot',
      headerName: 'Time Slot',
      width: 100,
    },
    {
      field: 'assignedCollector',
      headerName: 'Assigned To',
      width: 130,
      valueGetter: (value, row) => row.assignedCollector?.name || 'Not Assigned',
    },
    {
      field: 'homeCollectionStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.homeCollectionStatus}
          size="small"
          sx={{ 
            bgcolor: HOME_COLLECTION_STATUS_COLORS[params.row.homeCollectionStatus as HomeCollectionStatus], 
            color: 'white' 
          }}
        />
      ),
    },
    {
      field: 'distance',
      headerName: 'Distance',
      width: 100,
      valueGetter: (value, row) => `${row.distance} km`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.homeCollectionStatus === 'PendingAssignment' && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedHomeCollection(params.row);
                setAssignCollectorDialogOpen(true);
              }}
            >
              Assign
            </Button>
          )}
          <Tooltip title="View on Map">
            <IconButton
              size="small"
              color="primary"
              href={getGoogleMapsUrl(params.row.address)}
              target="_blank"
            >
              <PlaceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Call Patient">
            <IconButton size="small" color="primary" href={`tel:${params.row.patient.mobile}`}>
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Apply filters to lab collections
  const filteredLabCollections = pendingCollections.filter(collection => {
    if (labFilters.search && !collection.tokenNumber.toLowerCase().includes(labFilters.search.toLowerCase()) &&
        !collection.patient.name.toLowerCase().includes(labFilters.search.toLowerCase()) &&
        !collection.sampleID.toLowerCase().includes(labFilters.search.toLowerCase())) {
      return false;
    }
    if (labFilters.status !== 'All' && collection.status !== labFilters.status) {
      return false;
    }
    if (labFilters.type !== 'All' && collection.bookingType !== labFilters.type) {
      return false;
    }
    if (labFilters.time === 'Overdue' && !isOverdue(collection.bookingTime)) {
      return false;
    }
    if (labFilters.time === 'Next 1 Hour' && calculateWaitingMinutes(collection.bookingTime) > 60) {
      return false;
    }
    return true;
  });

  // Apply filters to home collections
  const filteredHomeCollections = homeCollections.filter(collection => {
    if (homeFilters.search && !collection.tokenNumber.toLowerCase().includes(homeFilters.search.toLowerCase()) &&
        !collection.patient.name.toLowerCase().includes(homeFilters.search.toLowerCase())) {
      return false;
    }
    if (homeFilters.status !== 'All' && collection.homeCollectionStatus !== homeFilters.status) {
      return false;
    }
    if (homeFilters.area !== 'All' && collection.area !== homeFilters.area) {
      return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Sample Collection Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshData}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => setCollectedViewDialogOpen(true)}
            >
              View Collected
            </Button>
            <Badge badgeContent={qualityIssues.length} color="error">
              <Button
                variant="outlined"
                color="error"
                startIcon={<WarningIcon />}
                onClick={() => setQualityIssuesDialogOpen(true)}
              >
                Quality Issues
              </Button>
            </Badge>
          </Stack>
        </Stack>

        {/* Quick Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Pending Collections
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#FF9800">
                    {stats.pendingCollections}
                  </Typography>
                </Box>
                <HourglassEmptyIcon sx={{ fontSize: 48, color: '#FF9800' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Today&apos;s Collections
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                    {stats.todaysCollections}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#4CAF50' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Home Collections Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2196F3">
                    {stats.homePending}
                  </Typography>
                </Box>
                <LocalShippingIcon sx={{ fontSize: 48, color: '#2196F3' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Quality Issues
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#F44336">
                    {stats.qualityIssues}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: '#F44336' }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
            <Tab label="Lab Collection" />
            <Tab label="Home Collection" />
          </Tabs>
        </Box>

        {/* Lab Collection Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Filters */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
                  <TextField
                    label="Search"
                    size="small"
                    value={labFilters.search}
                    onChange={(e) => setLabFilters({ ...labFilters, search: e.target.value })}
                    placeholder="Token, Patient, Sample ID"
                  />
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={labFilters.status}
                      label="Status"
                      onChange={(e) => setLabFilters({ ...labFilters, status: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Collected">Collected</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={labFilters.type}
                      label="Type"
                      onChange={(e) => setLabFilters({ ...labFilters, type: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="WalkIn">Walk-in</MenuItem>
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Time</InputLabel>
                    <Select
                      value={labFilters.time}
                      label="Time"
                      onChange={(e) => setLabFilters({ ...labFilters, time: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Overdue">Overdue (&gt;30 mins)</MenuItem>
                      <MenuItem value="Next 1 Hour">Next 1 Hour</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={labFilters.sort}
                      label="Sort By"
                      onChange={(e) => setLabFilters({ ...labFilters, sort: e.target.value })}
                    >
                      <MenuItem value="Time">Time</MenuItem>
                      <MenuItem value="Patient">Patient Name</MenuItem>
                      <MenuItem value="Token">Token Number</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* DataGrid */}
            <Card>
              <DataGrid
                rows={filteredLabCollections}
                columns={labCollectionColumns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[25, 50, 100]}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => setBulkSelected(newSelection)}
                getRowClassName={(params) => {
                  if (isOverdue(params.row.bookingTime)) return 'overdue-row';
                  if (isUrgent(params.row.bookingTime, params.row.priority)) return 'urgent-row';
                  return '';
                }}
                sx={{
                  '& .overdue-row': { bgcolor: '#FFEBEE' },
                  '& .urgent-row': { bgcolor: '#FFF9C4' },
                  height: 600,
                }}
              />
            </Card>

            {/* Bulk Actions */}
            {('ids' in bulkSelected && bulkSelected.ids.size > 0) && (
              <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                <Paper elevation={6} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography>{'ids' in bulkSelected && bulkSelected.ids.size} selected</Typography>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setBatchCollectionDialogOpen(true)}
                    >
                      Bulk Collect
                    </Button>
                    <Button variant="outlined" startIcon={<PrintIcon />}>
                      Print Labels
                    </Button>
                  </Stack>
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {/* Home Collection Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Filters */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
                  <TextField
                    label="Search"
                    size="small"
                    value={homeFilters.search}
                    onChange={(e) => setHomeFilters({ ...homeFilters, search: e.target.value })}
                    placeholder="Token, Patient"
                  />
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={homeFilters.status}
                      label="Status"
                      onChange={(e) => setHomeFilters({ ...homeFilters, status: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="PendingAssignment">Pending Assignment</MenuItem>
                      <MenuItem value="Assigned">Assigned</MenuItem>
                      <MenuItem value="InProgress">In Progress</MenuItem>
                      <MenuItem value="Collected">Collected</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Area</InputLabel>
                    <Select
                      value={homeFilters.area}
                      label="Area"
                      onChange={(e) => setHomeFilters({ ...homeFilters, area: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      {getUniqueAreas(homeCollections).map(area => (
                        <MenuItem key={area} value={area}>{area}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Collector</InputLabel>
                    <Select
                      value={homeFilters.collector}
                      label="Collector"
                      onChange={(e) => setHomeFilters({ ...homeFilters, collector: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      {collectors.map(collector => (
                        <MenuItem key={collector.id} value={collector.id}>{collector.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<RouteIcon />}
                    onClick={() => setRoutePlanningDialogOpen(true)}
                  >
                    Create Route
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* DataGrid */}
            <Card>
              <DataGrid
                rows={filteredHomeCollections}
                columns={homeCollectionColumns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[25, 50, 100]}
                sx={{ height: 600 }}
              />
            </Card>
          </Box>
        )}

        {/* Floating Scan Button */}
        <Fab
          color="primary"
          aria-label="scan"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setScannerDialogOpen(true)}
        >
          <QrCodeScannerIcon />
        </Fab>
      </Box>

      {/* Collection Dialog */}
      <Dialog
        open={collectionDialogOpen}
        onClose={() => setCollectionDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Collect Sample
              </Typography>
              <Typography variant="h6" color="primary">
                Token: {selectedCollection?.tokenNumber}
              </Typography>
            </Box>
            <IconButton onClick={() => setCollectionDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCollection && (
            <Box>
              {/* Patient Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" mb={2}>Patient Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedCollection.patient.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Age / Gender</Typography>
                      <Typography variant="body1">{selectedCollection.patient.age} / {selectedCollection.patient.gender}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Mobile</Typography>
                      <Typography variant="body1">{selectedCollection.patient.mobile}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Patient ID</Typography>
                      <Typography variant="body1">{selectedCollection.patient.patientID}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Tests Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" mb={2}>Tests Ordered</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Sample Type</TableCell>
                        <TableCell>Volume (ml)</TableCell>
                        <TableCell>Container</TableCell>
                        <TableCell>Fasting</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCollection.tests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>{test.testName}</TableCell>
                          <TableCell>{test.sampleType}</TableCell>
                          <TableCell>{test.sampleVolume}</TableCell>
                          <TableCell>{test.containerType}</TableCell>
                          <TableCell>{test.fastingRequired ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              {selectedCollection.specialInstructions && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight="bold">Special Instructions:</Typography>
                  <Typography variant="body2">{selectedCollection.specialInstructions}</Typography>
                </Alert>
              )}

              {/* Collection Form */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" mb={2}>Collection Details</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Collected By</InputLabel>
                      <Select
                        value={collectionFormData.collectorID}
                        label="Collected By"
                        onChange={(e) => {
                          const collector = collectors.find(c => c.id === e.target.value);
                          setCollectionFormData({
                            ...collectionFormData,
                            collectorID: e.target.value,
                            collectorName: collector?.name || '',
                          });
                        }}
                      >
                        {collectors.map((collector) => (
                          <MenuItem key={collector.id} value={collector.id}>
                            {collector.name} ({collector.staffID})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Collection Date"
                      type="date"
                      value={collectionFormData.collectionDate}
                      onChange={(e) => setCollectionFormData({ ...collectionFormData, collectionDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <TextField
                      label="Collection Time"
                      type="time"
                      value={collectionFormData.collectionTime}
                      onChange={(e) => setCollectionFormData({ ...collectionFormData, collectionTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <FormControl fullWidth>
                      <InputLabel>Fasting Status</InputLabel>
                      <Select
                        value={collectionFormData.fastingStatus}
                        label="Fasting Status"
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, fastingStatus: e.target.value as any })}
                      >
                        <MenuItem value="Fasting">Fasting</MenuItem>
                        <MenuItem value="NonFasting">Non-Fasting</MenuItem>
                        <MenuItem value="NotApplicable">Not Applicable</MenuItem>
                      </Select>
                    </FormControl>

                    {collectionFormData.fastingStatus === 'Fasting' && (
                      <TextField
                        label="Fasting Hours"
                        type="number"
                        value={collectionFormData.fastingHours || ''}
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, fastingHours: parseInt(e.target.value) })}
                        fullWidth
                      />
                    )}

                    <FormControl fullWidth>
                      <InputLabel>Patient Condition</InputLabel>
                      <Select
                        value={collectionFormData.patientCondition}
                        label="Patient Condition"
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, patientCondition: e.target.value as PatientCondition })}
                      >
                        <MenuItem value="Normal">Normal</MenuItem>
                        <MenuItem value="Anxious">Anxious</MenuItem>
                        <MenuItem value="DifficultVeinAccess">Difficult Vein Access</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Collection Notes"
                      multiline
                      rows={2}
                      value={collectionFormData.collectionNotes || ''}
                      onChange={(e) => setCollectionFormData({ ...collectionFormData, collectionNotes: e.target.value })}
                      fullWidth
                      sx={{ gridColumn: 'span 2' }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Sample Details */}
              {collectionFormData.samples.map((sample, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" mb={2}>Sample {index + 1}: {sample.sampleType}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Tube Type</InputLabel>
                        <Select
                          value={sample.tubeType}
                          label="Tube Type"
                          onChange={(e) => {
                            const updated = [...collectionFormData.samples];
                            updated[index].tubeType = e.target.value;
                            setCollectionFormData({ ...collectionFormData, samples: updated });
                          }}
                        >
                          {Object.entries(TUBE_TYPES).map(([key, val]) => (
                            <MenuItem key={key} value={key}>{val.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        label="Number of Tubes"
                        type="number"
                        value={sample.numberOfTubes}
                        onChange={(e) => {
                          const updated = [...collectionFormData.samples];
                          updated[index].numberOfTubes = parseInt(e.target.value);
                          setCollectionFormData({ ...collectionFormData, samples: updated });
                        }}
                        fullWidth
                      />

                      <TextField
                        label="Volume Collected (ml)"
                        type="number"
                        value={sample.volumeCollected}
                        onChange={(e) => {
                          const updated = [...collectionFormData.samples];
                          updated[index].volumeCollected = parseFloat(e.target.value);
                          setCollectionFormData({ ...collectionFormData, samples: updated });
                        }}
                        fullWidth
                      />

                      <FormControl fullWidth>
                        <InputLabel>Sample Quality</InputLabel>
                        <Select
                          value={sample.quality}
                          label="Sample Quality"
                          onChange={(e) => {
                            const updated = [...collectionFormData.samples];
                            updated[index].quality = e.target.value as SampleQuality;
                            setCollectionFormData({ ...collectionFormData, samples: updated });
                          }}
                        >
                          {Object.entries(SAMPLE_QUALITY_OPTIONS).map(([key, val]) => (
                            <MenuItem key={key} value={key}>{val.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {sample.quality !== 'Good' && (
                        <TextField
                          label="Quality Issue Reason"
                          multiline
                          rows={2}
                          value={sample.qualityNotes || ''}
                          onChange={(e) => {
                            const updated = [...collectionFormData.samples];
                            updated[index].qualityNotes = e.target.value;
                            setCollectionFormData({ ...collectionFormData, samples: updated });
                          }}
                          fullWidth
                          sx={{ gridColumn: 'span 2' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Quality Checklist */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" mb={2}>Quality Checklist (All Required)</Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.qualityChecklist.patientVerified}
                          onChange={(e) => setCollectionFormData({
                            ...collectionFormData,
                            qualityChecklist: {
                              ...collectionFormData.qualityChecklist,
                              patientVerified: e.target.checked,
                            },
                          })}
                        />
                      }
                      label="Correct patient verified"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.qualityChecklist.correctTube}
                          onChange={(e) => setCollectionFormData({
                            ...collectionFormData,
                            qualityChecklist: {
                              ...collectionFormData.qualityChecklist,
                              correctTube: e.target.checked,
                            },
                          })}
                        />
                      }
                      label="Correct tube type used"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.qualityChecklist.adequateVolume}
                          onChange={(e) => setCollectionFormData({
                            ...collectionFormData,
                            qualityChecklist: {
                              ...collectionFormData.qualityChecklist,
                              adequateVolume: e.target.checked,
                            },
                          })}
                        />
                      }
                      label="Sample volume adequate"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.qualityChecklist.labelApplied}
                          onChange={(e) => setCollectionFormData({
                            ...collectionFormData,
                            qualityChecklist: {
                              ...collectionFormData.qualityChecklist,
                              labelApplied: e.target.checked,
                            },
                          })}
                        />
                      }
                      label="Label applied correctly"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.qualityChecklist.storedProperly}
                          onChange={(e) => setCollectionFormData({
                            ...collectionFormData,
                            qualityChecklist: {
                              ...collectionFormData.qualityChecklist,
                              storedProperly: e.target.checked,
                            },
                          })}
                        />
                      }
                      label="Sample stored properly"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.qualityChecklist.patientInformed}
                          onChange={(e) => setCollectionFormData({
                            ...collectionFormData,
                            qualityChecklist: {
                              ...collectionFormData.qualityChecklist,
                              patientInformed: e.target.checked,
                            },
                          })}
                        />
                      }
                      label="Patient informed about report time"
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" mb={2}>Next Steps</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Send to Department</InputLabel>
                      <Select
                        value={collectionFormData.department}
                        label="Send to Department"
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, department: e.target.value as Department })}
                      >
                        {DEPARTMENTS.map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={collectionFormData.priority}
                        label="Priority"
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, priority: e.target.value as any })}
                      >
                        <MenuItem value="Normal">Normal</MenuItem>
                        <MenuItem value="Urgent">Urgent</MenuItem>
                        <MenuItem value="STAT">STAT (Immediate)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collectionFormData.printLabels}
                          onChange={(e) => setCollectionFormData({ ...collectionFormData, printLabels: e.target.checked })}
                        />
                      }
                      label="Print Labels"
                      sx={{ gridColumn: 'span 2' }}
                    />

                    {collectionFormData.printLabels && (
                      <TextField
                        label="Number of Labels"
                        type="number"
                        value={collectionFormData.numberOfLabels}
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, numberOfLabels: parseInt(e.target.value) })}
                        fullWidth
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSubmitCollection}>
            Mark as Collected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Collector Dialog */}
      <Dialog
        open={assignCollectorDialogOpen}
        onClose={() => setAssignCollectorDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Collector</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Select Collector</InputLabel>
              <Select
                value={assignData.collectorID}
                label="Select Collector"
                onChange={(e) => setAssignData({ ...assignData, collectorID: e.target.value })}
              >
                {collectors.map((collector) => (
                  <MenuItem key={collector.id} value={collector.id}>
                    <Stack>
                      <Typography>{collector.name} ({collector.staffID})</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {collector.currentAssignments} assignments • {collector.availability}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Scheduled Time"
              type="datetime-local"
              value={assignData.scheduledTime}
              onChange={(e) => setAssignData({ ...assignData, scheduledTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Estimated Duration (minutes)"
              type="number"
              value={assignData.estimatedDuration}
              onChange={(e) => setAssignData({ ...assignData, estimatedDuration: parseInt(e.target.value) })}
              fullWidth
            />

            <TextField
              label="Special Instructions"
              multiline
              rows={3}
              value={assignData.specialInstructions}
              onChange={(e) => setAssignData({ ...assignData, specialInstructions: e.target.value })}
              fullWidth
            />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assignData.notifyCollector}
                    onChange={(e) => setAssignData({ ...assignData, notifyCollector: e.target.checked })}
                  />
                }
                label="Notify Collector (SMS/App)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assignData.notifyPatient}
                    onChange={(e) => setAssignData({ ...assignData, notifyPatient: e.target.checked })}
                  />
                }
                label="Notify Patient (SMS)"
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignCollectorDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignCollector}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scanner Dialog */}
      <Dialog open={scannerDialogOpen} onClose={() => setScannerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Scan Barcode/QR Code</DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <Box sx={{ width: '100%', height: 300, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Camera view would appear here</Typography>
            </Box>
            <Divider sx={{ width: '100%' }}>OR</Divider>
            <TextField
              label="Enter Sample ID / Token manually"
              fullWidth
              placeholder="S-2024-001 or T-2024-001"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quality Issues Dialog */}
      <Dialog
        open={qualityIssuesDialogOpen}
        onClose={() => setQualityIssuesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Quality Issues</DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sample ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Issue Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualityIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>{issue.sampleID}</TableCell>
                  <TableCell>{issue.patientName}</TableCell>
                  <TableCell>
                    <Chip label={issue.issueType} color="warning" size="small" />
                  </TableCell>
                  <TableCell>{issue.description}</TableCell>
                  <TableCell>
                    <Chip label={issue.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQualityIssuesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Collected Samples Dialog */}
      <Dialog
        open={collectedViewDialogOpen}
        onClose={() => setCollectedViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Today&apos;s Collected Samples</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Total: {collectedSamples.length} samples
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sample ID</TableCell>
                <TableCell>Token</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Tests</TableCell>
                <TableCell>Collected By</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collectedSamples.slice(0, 20).map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell>{sample.sampleID}</TableCell>
                  <TableCell>{sample.tokenNumber}</TableCell>
                  <TableCell>{sample.patient.name}</TableCell>
                  <TableCell>{sample.tests[0].testName}</TableCell>
                  <TableCell>{sample.collectedBy}</TableCell>
                  <TableCell>{sample.collectedAt ? formatTime(sample.collectedAt) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectedViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
