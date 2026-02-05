'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Badge,
  LinearProgress,
  Autocomplete,
  TablePagination,
} from '@mui/material';

import {
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Alarm as AlarmIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Close as CloseIcon,
  RefreshRounded as RefreshIcon,
  DashboardCustomize as DashboardCustomizeIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CallReceived as CallReceivedIcon,
  Verified as VerifiedIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

import { Collection, HomeCollection, CollectionStatus, HomeCollectionStatus, Priority } from '@/types/collection';
import {
  calculateWaitingTime,
  calculateWaitingMinutes,
  formatDateTime,
  formatAddress,
  generateCollectionSMS,
  generateCollectorSMS,
} from '@/utils/collectionHelpers';

// Helper functions for missing utilities
const getWaitingColor = (minutes: number): string => {
  if (minutes < 5) return '#4CAF50'; // Green
  if (minutes < 15) return '#FFC107'; // Yellow
  if (minutes < 30) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const getPriorityLabel = (priority: string): string => {
  switch (priority.toUpperCase()) {
    case 'STAT':
      return '🔴 STAT';
    case 'URGENT':
      return '🟠 Urgent';
    case 'NORMAL':
    default:
      return '⚪ Normal';
  }
};

const exportCollectionsToCSV = (collections: Collection[]): string => {
  const headers = [
    'Token Number',
    'Sample ID',
    'Patient Name',
    'Mobile',
    'Tests',
    'Booking Time',
    'Status',
    'Waiting Time (mins)'
  ];

  const rows = collections.map(c => [
    c.tokenNumber,
    c.sampleId,
    c.patientName,
    c.mobile,
    Array.isArray(c.tests) ? c.tests.join('; ') : '',
    new Date(c.bookingTime).toLocaleString(),
    c.status,
    c.waitingMinutes || 0
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

const downloadCSV = (content: string, filename: string = 'collections.csv'): void => {
  if (typeof window === 'undefined') return;
  
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// ============= MOCK DATA GENERATORS =============

const generateMockCollections = (count: number): Collection[] => {
  const testOptions = ['CBC', 'Blood Sugar', 'Lipid Profile', 'Urine Routine', 'Liver Function', 'Kidney Function', 'Thyroid'];
  const collections: Collection[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const bookingTime = new Date(now.getTime() - Math.random() * 120 * 60000); // 0-120 mins ago
    const waitingMinutes = Math.floor((now.getTime() - bookingTime.getTime()) / 60000);
    const priority = Math.random() > 0.85 ? 'STAT' : Math.random() > 0.7 ? 'Urgent' : 'Normal';

    collections.push({
      id: `coll-${i + 1}`,
      tokenNumber: `TKN-${String(i + 1).padStart(4, '0')}`,
      sampleId: `SMP-20260204-${String(i + 1).padStart(4, '0')}`,
      patientName: `Patient ${i + 1}`,
      age: Math.floor(Math.random() * 80) + 18,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      mobile: `98${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
      tests: testOptions.slice(0, Math.floor(Math.random() * 3) + 1) as any,
      sampleTypesRequired: ['Blood'],
      bookingTime: bookingTime,
      waitingMinutes,
      bookingType: Math.random() > 0.3 ? 'Walk-in' : 'Scheduled',
      status: 'Pending Collection' as CollectionStatus,
      priority: priority as Priority,
      createdAt: bookingTime,
      updatedAt: new Date(),
    });
  }

  return collections;
};

const generateMockHomeCollections = (count: number): HomeCollection[] => {
  const areas = ['Andheri', 'Dadar', 'Bandra', 'Powai', 'Colaba', 'Juhu', 'Kemps Corner', 'Mulund'];
  const statuses = ['Pending Assignment', 'Assigned', 'In Progress', 'Collected', 'Cancelled'];
  const timeSlots = ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM'];

  const collections: HomeCollection[] = [];

  for (let i = 0; i < count; i++) {
    collections.push({
      id: `home-${i + 1}`,
      tokenNumber: `HOME-${String(i + 1).padStart(4, '0')}`,
      sampleId: `SMP-HOME-${i + 1}`,
      patientName: `Home Patient ${i + 1}`,
      mobile: `98${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
      area: areas[Math.floor(Math.random() * areas.length)],
      address: `${i + 1}, Example Street, City`,
      preferredDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60000).toISOString(),
      preferredTimeSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)] as HomeCollectionStatus,
      tests: ['CBC', 'Blood Sugar'] as any,
      bookingTime: new Date(),
      bookingType: 'Scheduled',
      priority: 'Normal',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return collections;
};

// ============= COMPONENTS =============

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Stats Card Component
const StatsCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  onClick?: () => void;
}> = ({ icon, label, count, color, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 3 } : {},
      backgroundColor: color === '#4CAF50' ? '#f1f8e9' : color === '#FF9800' ? '#fff3e0' : color === '#2196F3' ? '#e3f2fd' : '#ffebee',
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ fontSize: 32, opacity: 0.8 }}>{icon}</Box>
        <Box>
          <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
            {count}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Collect Sample Dialog Component
const CollectSampleDialog: React.FC<{
  open: boolean;
  collection: Collection | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ open, collection, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    collectorName: '',
    quality: 'Good',
    tubeType: 'EDTA Tube',
    numberOfTubes: 1,
    volume: '',
    notes: '',
    printLabels: true,
    labelsCount: 1,
    fasting: 'NotApplicable',
    patientCondition: 'Normal',
    collectionSite: 'LeftArm',
    checklist: {
      patientVerified: false,
      tubeCorrect: false,
      volumeAdequate: false,
      labelApplied: false,
      sampleMixed: false,
      temperatureCorrect: false,
      patientInformed: false,
      instructionsGiven: false,
    },
  });

  const allChecked = Object.values(formData.checklist).every(v => v === true);

  const handleChecklistChange = (key: keyof typeof formData.checklist) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      }
    }));
  };

  const handleSubmit = () => {
    if (!formData.collectorName || !formData.volume) {
      alert('Please fill all required fields');
      return;
    }

    if (!allChecked) {
      alert('Please complete all quality checks');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon />
        Collect Sample - {collection?.tokenNumber}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {/* Patient Info Card */}
          <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 50, height: 50, bgcolor: '#2196F3' }}>
                  {collection?.patientName[0]}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {collection?.patientName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {collection?.age}Y / {collection?.gender} | Token: {collection?.tokenNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {collection?.mobile}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Divider />

          {/* Collection Form */}
          <TextField
            fullWidth
            label="Collector Name"
            value={formData.collectorName}
            onChange={(e) => setFormData(prev => ({ ...prev, collectorName: e.target.value }))}
            required
            size="small"
          />

          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                value={formData.tubeType}
                onChange={(e) => setFormData(prev => ({ ...prev, tubeType: e.target.value }))}
                size="small"
              >
                <MenuItem value="EDTA Tube">EDTA Tube (Purple)</MenuItem>
                <MenuItem value="Plain Tube">Plain Tube (Red)</MenuItem>
                <MenuItem value="Fluoride Tube">Fluoride Tube (Gray)</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Tubes"
                type="number"
                value={formData.numberOfTubes}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfTubes: parseInt(e.target.value) }))}
                size="small"
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Volume Collected (ml)"
            type="number"
            value={formData.volume}
            onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
            required
            size="small"
          />

          <FormControl fullWidth size="small">
            <FormLabel sx={{ mb: 1 }}>Sample Quality</FormLabel>
            <RadioGroup
              value={formData.quality}
              onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value }))}
              row
            >
              <FormControlLabel value="Good" control={<Radio />} label="✅ Good" />
              <FormControlLabel value="Hemolyzed" control={<Radio />} label="⚠️ Hemolyzed" />
              <FormControlLabel value="Clotted" control={<Radio />} label="⚠️ Clotted" />
              <FormControlLabel value="Contaminated" control={<Radio />} label="❌ Contaminated" />
            </RadioGroup>
          </FormControl>

          {formData.quality !== 'Good' && (
            <TextField
              fullWidth
              label="Quality Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Explain the quality issue"
              required
              size="small"
            />
          )}

          <Select
            fullWidth
            value={formData.fasting}
            onChange={(e) => setFormData(prev => ({ ...prev, fasting: e.target.value }))}
            size="small"
          >
            <MenuItem value="Fasting">Fasting</MenuItem>
            <MenuItem value="NonFasting">Non-Fasting</MenuItem>
            <MenuItem value="NotApplicable">Not Applicable</MenuItem>
          </Select>

          <Select
            fullWidth
            value={formData.patientCondition}
            onChange={(e) => setFormData(prev => ({ ...prev, patientCondition: e.target.value }))}
            size="small"
          >
            <MenuItem value="Normal">Normal</MenuItem>
            <MenuItem value="Anxious">Anxious</MenuItem>
            <MenuItem value="DifficultVeinAccess">Difficult Vein Access</MenuItem>
            <MenuItem value="Pediatric">Pediatric</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>

          {/* Quality Checklist */}
          <Alert severity="info" icon={<VerifiedIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Quality Checklist (All required)
            </Typography>
            <FormGroup size="small">
              {Object.entries(formData.checklist).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={value}
                      onChange={() => handleChecklistChange(key as any)}
                      size="small"
                    />
                  }
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  sx={{ fontSize: '0.9rem' }}
                />
              ))}
            </FormGroup>
          </Alert>

          {/* Label Printing */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.printLabels}
                onChange={(e) => setFormData(prev => ({ ...prev, printLabels: e.target.checked }))}
              />
            }
            label="Print Labels Now"
          />
          {formData.printLabels && (
            <TextField
              fullWidth
              label="Number of Labels"
              type="number"
              value={formData.labelsCount}
              onChange={(e) => setFormData(prev => ({ ...prev, labelsCount: parseInt(e.target.value) }))}
              inputProps={{ min: 1, max: 10 }}
              size="small"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          disabled={!formData.collectorName || !formData.volume || !allChecked}
        >
          Mark as Collected
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Barcode Scanner Dialog
const BarcodeScannerDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}> = ({ open, onClose, onScan }) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualScan = () => {
    if (manualInput.trim()) {
      onScan(manualInput);
      setManualInput('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <QrCodeScannerIcon />
        Scan Sample Barcode
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Alert severity="info">
            Camera scanning requires browser permission. Use manual entry as fallback.
          </Alert>

          <TextField
            fullWidth
            label="Or Enter Sample ID Manually"
            placeholder="SMP-20260204-0001"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualScan();
              }
            }}
            autoFocus
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleManualScan} variant="contained" color="primary">
          Process
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============= MAIN COMPONENT =============

export default function SampleCollectionPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingCollections, setPendingCollections] = useState<Collection[]>([]);
  const [homeCollections, setHomeCollections] = useState<HomeCollection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [openCollectDialog, setOpenCollectDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [openScannerDialog, setOpenScannerDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Initialize mock data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const collections = generateMockCollections(45);
      const homeCollectionsList = generateMockHomeCollections(15);
      setPendingCollections(collections);
      setHomeCollections(homeCollectionsList);
      setLoading(false);
    }, 500);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setPendingCollections((prev) =>
        prev.map((c) => ({
          ...c,
          waitingMinutes: Math.floor((new Date().getTime() - new Date(c.bookingTime).getTime()) / 60000),
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter collections
  const filteredCollections = pendingCollections.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.tokenNumber.toLowerCase().includes(query) ||
      c.patientName.toLowerCase().includes(query) ||
      c.sampleId.toLowerCase().includes(query) ||
      c.mobile.includes(query);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.bookingType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    pending: pendingCollections.length,
    today: Math.floor(pendingCollections.length * 0.5),
    homeCollectionsPending: homeCollections.filter(c => c.status === 'Pending Assignment').length,
    qualityIssues: 2,
    overdue: pendingCollections.filter(c => (c.waitingMinutes || 0) > 30).length,
  };

  const handleCollectClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setOpenCollectDialog(true);
  };

  const handleCollectSubmit = (data: any) => {
    setSnackbar({
      open: true,
      message: `Sample ${selectedCollection?.tokenNumber} marked as collected successfully`,
      severity: 'success',
    });
    setPendingCollections((prev) =>
      prev.filter((c) => c.id !== selectedCollection?.id)
    );
  };

  const handleSelectCollection = (id: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCollections(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCollections.size === filteredCollections.length) {
      setSelectedCollections(new Set());
    } else {
      setSelectedCollections(new Set(filteredCollections.map((c) => c.id)));
    }
  };

  const handleExportCSV = () => {
    const csv = exportCollectionsToCSV(filteredCollections);
    downloadCSV(csv, `collections-${new Date().toISOString().split('T')[0]}.csv`);
    setSnackbar({
      open: true,
      message: 'Collections exported to CSV successfully',
      severity: 'success',
    });
  };

  const handleScan = (barcode: string) => {
    const collection = pendingCollections.find(
      (c) => c.sampleId.includes(barcode) || c.tokenNumber.includes(barcode)
    );

    if (collection) {
      handleCollectClick(collection);
      setSnackbar({
        open: true,
        message: `Found: ${collection.patientName}`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Sample not found in pending collections',
        severity: 'error',
      });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography>Loading collections...</Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  const displayedCollections = filteredCollections.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Sample Collection Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage and track all sample collections from patients
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard
            icon={<HourglassEmptyIcon />}
            label="Pending Collections"
            count={stats.pending}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard
            icon={<CheckCircleIcon />}
            label="Collected Today"
            count={stats.today}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard
            icon={<LocalShippingIcon />}
            label="Home Pending"
            count={stats.homeCollectionsPending}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard
            icon={<WarningIcon />}
            label="Quality Issues"
            count={stats.qualityIssues}
            color="#F44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard
            icon={<AlarmIcon />}
            label="Overdue (>30m)"
            count={stats.overdue}
            color="#F44336"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="collection tabs"
        >
          <Tab label="Lab Collection" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Home Collection" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
      </Paper>

      {/* LAB COLLECTION TAB */}
      <TabPanel value={activeTab} index={0}>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search by token, name, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Select
                fullWidth
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                size="small"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending Collection">Pending</MenuItem>
                <MenuItem value="Collected">Collected</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Select
                fullWidth
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
                size="small"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Walk-in">Walk-in</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Scan barcode">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => setOpenScannerDialog(true)}
                  >
                    Scan
                  </Button>
                </Tooltip>
                <Tooltip title="Export to CSV">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                  >
                    Export
                  </Button>
                </Tooltip>
                <Tooltip title="Auto-refresh every minute">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Auto"
                    sx={{ m: 0 }}
                  />
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Collections Table */}
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedCollections.size > 0 &&
                      selectedCollections.size < filteredCollections.length
                    }
                    checked={
                      filteredCollections.length > 0 &&
                      selectedCollections.size === filteredCollections.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Token</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sample ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Age/Gender</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tests</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Wait Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedCollections.map((collection) => (
                <TableRow
                  key={collection.id}
                  hover
                  sx={{
                    backgroundColor:
                      collection.priority === 'STAT'
                        ? '#ffebee'
                        : (collection.waitingMinutes || 0) > 30
                        ? '#fff3e0'
                        : 'white',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCollections.has(collection.id)}
                      onChange={() => handleSelectCollection(collection.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {getPriorityLabel(collection.priority)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {collection.tokenNumber}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{collection.sampleId}</Typography>
                  </TableCell>
                  <TableCell>{collection.patientName}</TableCell>
                  <TableCell>
                    {collection.age}/{collection.gender}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Call patient">
                      <IconButton
                        size="small"
                        href={`tel:${collection.mobile}`}
                        sx={{ p: 0.5 }}
                      >
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={Array.isArray(collection.tests) ? collection.tests.join(', ') : ''}>
                      <Typography variant="body2">
                        {Array.isArray(collection.tests) && collection.tests.slice(0, 2).join(', ')}
                        {Array.isArray(collection.tests) && collection.tests.length > 2 && ` +${collection.tests.length - 2}`}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: getWaitingColor(collection.waitingMinutes || 0),
                      }}
                    >
                      {collection.waitingMinutes} min
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={collection.bookingType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Collect Sample">
                        <IconButton
                          size="small"
                          onClick={() => handleCollectClick(collection)}
                          color="primary"
                          sx={{ p: 0.5 }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info" sx={{ p: 0.5 }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Token">
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCollections.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              No collections found matching your criteria
            </Typography>
          </Box>
        ) : (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCollections.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TabPanel>

      {/* HOME COLLECTION TAB */}
      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Select fullWidth defaultValue="all" size="small">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending Assignment">Pending Assignment</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search by patient name..."
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="contained" startIcon={<AddIcon />}>
                Create Route
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<EditIcon />}>
                Assign Collectors
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Token</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Area</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Collector</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeCollections.map((collection) => (
                <TableRow key={collection.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{collection.tokenNumber}</TableCell>
                  <TableCell>{collection.patientName}</TableCell>
                  <TableCell>
                    <Tooltip title="Call patient">
                      <IconButton size="small" href={`tel:${collection.mobile}`} sx={{ p: 0.5 }}>
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{collection.area}</TableCell>
                  <TableCell>
                    {new Date(collection.preferredDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{collection.preferredTimeSlot}</TableCell>
                  <TableCell>
                    <Chip
                      label={collection.status}
                      size="small"
                      color={
                        collection.status === 'Collected'
                          ? 'success'
                          : collection.status === 'Cancelled'
                          ? 'error'
                          : 'warning'
                      }
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {collection.assignedCollector ? (
                      <Typography variant="body2">{collection.assignedCollector.name}</Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not Assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" sx={{ p: 0.5 }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Navigate">
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <CallReceivedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Dialogs */}
      <CollectSampleDialog
        open={openCollectDialog}
        collection={selectedCollection}
        onClose={() => setOpenCollectDialog(false)}
        onSubmit={handleCollectSubmit}
      />

      <BarcodeScannerDialog
        open={openScannerDialog}
        onClose={() => setOpenScannerDialog(false)}
        onScan={handleScan}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button - Scan */}
      <Tooltip title="Scan Sample" placement="left">
        <Button
          variant="contained"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            borderRadius: '50%',
            width: 60,
            height: 60,
            minWidth: 0,
            zIndex: 1000,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 5,
            },
          }}
          onClick={() => setOpenScannerDialog(true)}
        >
          <QrCodeScannerIcon sx={{ fontSize: 28 }} />
        </Button>
      </Tooltip>
    </Container>
  );
}
