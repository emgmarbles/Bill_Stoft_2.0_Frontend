import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const statCards = [
    { title: 'Total Bills', value: '0', icon: <ReceiptIcon sx={{ fontSize: 36, color: 'primary.main' }} />, path: '/bills' },
    { title: 'Customers', value: '0', icon: <PeopleIcon sx={{ fontSize: 36, color: 'info.main' }} />, path: '/customers' },
    { title: 'Products', value: '0', icon: <InventoryIcon sx={{ fontSize: 36, color: 'success.main' }} />, path: '/products' },
    { title: 'Stock Lots', value: '0', icon: <TrendingUpIcon sx={{ fontSize: 36, color: 'warning.main' }} />, path: '/current-stock' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome to ELBAT Stock & Billing System
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/bills/new')}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          New Bill
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Action Info Paper */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          System Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Decoupled Full Stack React + Django REST Framework Architecture. Responsive layout adapts for desktop (sidebar navigation) and mobile/tablet devices (mobile app bottom navigation).
        </Typography>
      </Paper>
    </Box>
  );
}
