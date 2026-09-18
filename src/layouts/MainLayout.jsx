import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ReceiptLong as ReceiptIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  LocalShipping as ShippingIcon,
  Calculate as CalculateIcon,
  Mail as MailIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  MoreHoriz as MoreIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

export const navItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Local Sale Bills', path: '/bills', icon: <ReceiptIcon /> },
  { text: 'GST Sell Bills', path: '/gst-bills', icon: <ReceiptIcon /> },
  { text: 'Purchase GST Bills', path: '/purchase-gst-bills', icon: <ReceiptIcon /> },
  { text: 'Customers', path: '/customers', icon: <PeopleIcon /> },
  { text: 'GST Customers', path: '/gst-customers', icon: <PeopleIcon /> },
  { text: 'Purchase Suppliers', path: '/purchase-gst-suppliers', icon: <PeopleIcon /> },
  { text: 'Products', path: '/products', icon: <CategoryIcon /> },
  { text: 'Current Stock', path: '/current-stock', icon: <InventoryIcon /> },
  { text: 'Purchase Validation', path: '/purchase-validation', icon: <ShippingIcon /> },
  { text: 'Delivery Sectors', path: '/delivery-sectors', icon: <ShippingIcon /> },
  { text: 'Delivery Settlements', path: '/delivery-settlements', icon: <ShippingIcon /> },
  { text: 'Order Quotation', path: '/order-quotation', icon: <CalculateIcon /> },
  { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  { text: 'Sales Analysis', path: '/analysis', icon: <AssessmentIcon /> },
  { text: 'Envelopes', path: '/envelope', icon: <MailIcon /> },
  { text: 'Backups', path: '/backups', icon: <BackupIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Determine active bottom navigation item
  const getBottomNavValue = () => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/bills')) return '/bills';
    if (location.pathname.startsWith('/current-stock')) return '/current-stock';
    if (location.pathname.startsWith('/reports')) return '/reports';
    return 'more';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ELBAT Stock & Billing
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user.username || 'User'}
            </Typography>
          )}
          <IconButton color="inherit" onClick={logout} title="Logout" size="small">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar (Medium and larger screens) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: '#ffffff',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 1 }}>
            <List dense>
              {navItems.map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ px: 1, py: 0.25 }}>
                    <ListItemButton
                      selected={selected}
                      onClick={() => handleNavClick(item.path)}
                      sx={{
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '& .MuiListItemIcon-root': { color: 'white' },
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: selected ? 'white' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selected ? 600 : 400 }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          mb: isMobile ? '64px' : 0, // Space for bottom bar on mobile/tablet
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>

      {/* Mobile/Tablet Bottom Navigation (for small & mid display devices) */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.appBar,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
            borderTop: '1px solid #e0e0e0',
          }}
          elevation={3}
        >
          <BottomNavigation
            value={getBottomNavValue()}
            onChange={(event, newValue) => {
              if (newValue === 'more') {
                setMobileMenuOpen(true);
              } else {
                handleNavClick(newValue);
              }
            }}
            showLabels
          >
            <BottomNavigationAction label="Home" value="/" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Bills" value="/bills" icon={<ReceiptIcon />} />
            <BottomNavigationAction label="Stock" value="/current-stock" icon={<InventoryIcon />} />
            <BottomNavigationAction label="Reports" value="/reports" icon={<AssessmentIcon />} />
            <BottomNavigationAction label="Menu" value="more" icon={<MoreIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile Swipeable Drawer Menu for remaining items */}
      <SwipeableDrawer
        anchor="bottom"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpen={() => setMobileMenuOpen(true)}
        sx={{
          zIndex: (t) => t.zIndex.modal + 1,
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
            pb: 4,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>All Navigation</Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflowY: 'auto', p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            {navItems.map((item) => {
              const selected = location.pathname === item.path;
              return (
                <Box
                  key={item.text}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 1.5,
                    border: '1.5px solid',
                    borderColor: selected ? 'primary.main' : '#e2e8f0',
                    borderRadius: 3,
                    bgcolor: selected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    boxShadow: selected ? '0 2px 6px rgba(37,99,235,0.15)' : 'none',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: selected ? '#eff6ff' : '#f8fafc',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                    },
                    '&:active': {
                      transform: 'scale(0.96)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: selected ? 'primary.main' : 'primary.dark',
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': { fontSize: 26 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: selected ? 700 : 500,
                      color: selected ? 'primary.main' : 'text.primary',
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}
