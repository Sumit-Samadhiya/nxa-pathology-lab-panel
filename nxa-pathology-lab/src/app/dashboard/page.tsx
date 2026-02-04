'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Science as ScienceIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Patients', value: '1,234', icon: <PeopleIcon />, color: '#C4590A' },
    { title: 'Tests Today', value: '87', icon: <ScienceIcon />, color: '#00008B' },
    { title: 'Pending Reports', value: '23', icon: <DescriptionIcon />, color: '#FF6B35' },
    { title: 'Revenue Today', value: '₹45,678', icon: <TrendingUpIcon />, color: '#4CAF50' },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: stat.color,
                        color: 'white',
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Typography color="textSecondary">Activity feed will be displayed here</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Typography color="textSecondary">Quick action buttons will be here</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
