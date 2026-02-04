'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Grid, Card, CardContent } from '@mui/material';
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

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {testCategories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
            </Grid>
          ))}
        </Grid>

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
