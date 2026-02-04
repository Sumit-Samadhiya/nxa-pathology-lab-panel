'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Card, CardContent } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TestsPage() {
  const testCategories = [
    { name: 'Hematology', count: 45, color: '#C4590A' },
    { name: 'Biochemistry', count: 67, color: '#00008B' },
    { name: 'Microbiology', count: 32, color: '#4CAF50' },
    { name: 'Immunology', count: 28, color: '#FF9800' },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Test Catalog
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add New Test
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 3,
          }}
        >
          {testCategories.map((category, index) => (
            <Box key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: category.color }}>
                    {category.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {category.name} Tests
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Paper sx={{ p: 3, minHeight: 400 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Available Tests
          </Typography>
          <Typography color="textSecondary">
            Complete list of available tests with pricing and details will be displayed here
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
