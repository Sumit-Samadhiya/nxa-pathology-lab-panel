'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  CalendarToday as CalendarTodayIcon,
  DirectionsWalk as DirectionsWalkIcon,
  HourglassEmpty as HourglassEmptyIcon,
  AssignmentLate as AssignmentLateIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  PersonAdd as PersonAddIcon,
  LocalHospital as LocalHospitalIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import type { Appointment, HomeCollection, HomeCollectionFilter } from '@/types/dashboard';

export default function DashboardPage() {
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [homeCollectionFilter, setHomeCollectionFilter] = useState<HomeCollectionFilter>('All');

  // Statistics data
  const stats = [
    {
      title: "Today's Bookings",
      value: 24,
      icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Walk-in Patients',
      value: 12,
      icon: <DirectionsWalkIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Pending Samples',
      value: 8,
      icon: <HourglassEmptyIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Pending Reports',
      value: 5,
      icon: <AssignmentLateIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
    {
      title: "Today's Revenue",
      value: '₹45,250',
      icon: <CurrencyRupeeIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  // Quick actions handlers
  const handleRegisterPatient = () => {
    console.log('Navigate to register walk-in patient');
  };

  const handleCollectSample = () => {
    console.log('Navigate to collect sample');
  };

  const handleGenerateReport = () => {
    console.log('Navigate to generate report');
  };

  // Today's Appointments dummy data
  const appointments: Appointment[] = [
    { id: '1', token: 'TOK-20260204-0001', patientName: 'Rajesh Kumar', testName: 'Complete Blood Count', time: '09:00 AM', status: 'Booked' },
    { id: '2', token: 'TOK-20260204-0002', patientName: 'Priya Sharma', testName: 'Lipid Profile', time: '09:30 AM', status: 'Collected' },
    { id: '3', token: 'TOK-20260204-0003', patientName: 'Amit Patel', testName: 'Thyroid Function Test', time: '10:00 AM', status: 'Testing' },
    { id: '4', token: 'TOK-20260204-0004', patientName: 'Sunita Verma', testName: 'HbA1c', time: '10:30 AM', status: 'Ready' },
    { id: '5', token: 'TOK-20260204-0005', patientName: 'Vikram Singh', testName: 'Liver Function Test', time: '11:00 AM', status: 'Booked' },
    { id: '6', token: 'TOK-20260204-0006', patientName: 'Meena Gupta', testName: 'Urine Routine', time: '11:30 AM', status: 'Collected' },
    { id: '7', token: 'TOK-20260204-0007', patientName: 'Rahul Mehta', testName: 'Kidney Function Test', time: '12:00 PM', status: 'Testing' },
    { id: '8', token: 'TOK-20260204-0008', patientName: 'Kavita Desai', testName: 'Vitamin D', time: '12:30 PM', status: 'Booked' },
    { id: '9', token: 'TOK-20260204-0009', patientName: 'Suresh Reddy', testName: 'Blood Sugar Fasting', time: '01:00 PM', status: 'Ready' },
    { id: '10', token: 'TOK-20260204-0010', patientName: 'Anjali Joshi', testName: 'Complete Blood Count', time: '01:30 PM', status: 'Collected' },
  ];

  // Home Collection dummy data
  const homeCollections: HomeCollection[] = [
    { id: '1', token: 'HC-20260204-0001', patientName: 'Ramesh Agarwal', address: 'A-101, Green Valley Apartments, Sector 15', scheduledTime: '08:00 AM', collectorName: 'Sunil Kumar', status: 'Assigned' },
    { id: '2', token: 'HC-20260204-0002', patientName: 'Geeta Malhotra', address: 'B-205, Sunrise Heights, MG Road', scheduledTime: '09:00 AM', collectorName: null, status: 'Pending' },
    { id: '3', token: 'HC-20260204-0003', patientName: 'Manoj Tiwari', address: 'C-45, Lake View Colony, Near City Mall', scheduledTime: '10:00 AM', collectorName: 'Rakesh Sharma', status: 'Collected' },
    { id: '4', token: 'HC-20260204-0004', patientName: 'Deepa Nair', address: 'D-78, Palm Grove, Whitefield', scheduledTime: '11:00 AM', collectorName: null, status: 'Pending' },
    { id: '5', token: 'HC-20260204-0005', patientName: 'Kiran Bose', address: 'E-12, Royal Residency, JP Nagar', scheduledTime: '12:00 PM', collectorName: 'Sunil Kumar', status: 'Assigned' },
    { id: '6', token: 'HC-20260204-0006', patientName: 'Arun Rao', address: 'F-90, Silver Oaks, Electronic City', scheduledTime: '02:00 PM', collectorName: 'Rakesh Sharma', status: 'Collected' },
    { id: '7', token: 'HC-20260204-0007', patientName: 'Pooja Iyer', address: 'G-23, Brigade Gateway, Rajaji Nagar', scheduledTime: '03:00 PM', collectorName: null, status: 'Pending' },
    { id: '8', token: 'HC-20260204-0008', patientName: 'Vijay Chopra', address: 'H-56, Prestige Park View, Koramangala', scheduledTime: '04:00 PM', collectorName: 'Sunil Kumar', status: 'Assigned' },
  ];

  // Filter home collections
  const filteredHomeCollections = homeCollectionFilter === 'All' 
    ? homeCollections 
    : homeCollections.filter(hc => hc.status === homeCollectionFilter);

  // Appointment columns
  const appointmentColumns: GridColDef[] = [
    { field: 'token', headerName: 'Token', width: 180 },
    { field: 'patientName', headerName: 'Patient Name', width: 200 },
    { field: 'testName', headerName: 'Test Name', width: 220 },
    { field: 'time', headerName: 'Time', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const statusColors: Record<string, 'warning' | 'info' | 'default' | 'success'> = {
          Booked: 'warning',
          Collected: 'info',
          Testing: 'default',
          Ready: 'success',
        };
        return (
          <Chip 
            label={params.value} 
            color={statusColors[params.value as string]} 
            size="small" 
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => console.log('View', params.row.token)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="success" 
            onClick={() => console.log('Collect Sample', params.row.token)}
            disabled={params.row.status !== 'Booked'}
          >
            <ScienceIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Home Collection columns
  const homeCollectionColumns: GridColDef[] = [
    { field: 'token', headerName: 'Token', width: 170 },
    { field: 'patientName', headerName: 'Patient Name', width: 180 },
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 280,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.value}
        </Box>
      ),
    },
    { field: 'scheduledTime', headerName: 'Scheduled Time', width: 140 },
    { 
      field: 'collectorName', 
      headerName: 'Collector', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => params.value || 'Not Assigned',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const statusColors: Record<string, 'default' | 'info' | 'success'> = {
          Pending: 'default',
          Assigned: 'info',
          Collected: 'success',
        };
        return (
          <Chip 
            label={params.value} 
            color={statusColors[params.value as string]} 
            size="small" 
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Button 
            size="small" 
            variant="text" 
            onClick={() => console.log('Assign collector', params.row.token)}
            disabled={params.row.status === 'Collected'}
          >
            Assign
          </Button>
          <IconButton size="small" color="primary" onClick={() => console.log('View details', params.row.token)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {stats.map((stat, index) => (
            <Card key={index} elevation={3}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" variant="body2" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4">{stat.value}</Typography>
                    </Box>
                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>

        {/* Quick Actions */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={handleRegisterPatient}
                size="large"
              >
                Register Walk-in Patient
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<LocalHospitalIcon />}
                onClick={handleCollectSample}
                size="large"
              >
                Collect Sample
              </Button>
              <Button
                variant="contained"
                color="info"
                startIcon={<DescriptionIcon />}
                onClick={handleGenerateReport}
                size="large"
              >
                Generate Report
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Today&apos;s Appointments
              </Typography>
              <TextField
                size="small"
                placeholder="Search appointments..."
                value={appointmentSearch}
                onChange={(e) => setAppointmentSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <DataGrid
              rows={appointments.filter(apt => 
                appointmentSearch === '' || 
                apt.patientName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                apt.token.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                apt.testName.toLowerCase().includes(appointmentSearch.toLowerCase())
              )}
              columns={appointmentColumns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
            />
          </CardContent>
        </Card>

        {/* Home Collection */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Home Collection - Today
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={homeCollectionFilter}
                  label="Filter by Status"
                  onChange={(e) => setHomeCollectionFilter(e.target.value as HomeCollectionFilter)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="Collected">Collected</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <DataGrid
              rows={filteredHomeCollections}
              columns={homeCollectionColumns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
            />
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
