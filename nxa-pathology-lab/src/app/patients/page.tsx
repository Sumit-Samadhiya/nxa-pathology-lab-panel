'use client';

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Patient Registration
          </Typography>
          <Button variant="contained" startIcon={<PersonAddIcon />}>
            Add New Patient
          </Button>
        </Box>

        <Paper sx={{ p: 3, minHeight: 400 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Patient List
          </Typography>
          <Typography color="textSecondary">
            Patient registration form and list will be displayed here
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
