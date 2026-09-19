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
  Chip,
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
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 270;

export const navGroups = [
  {
    group: 'MAIN',
    items: [{ text: 'Dashboard', path: '/', icon: <DashboardIcon /> }],
  },
  {
    group: 'SALES & INVOICING',
    items: [
      { text: 'Local Sale Bills', path: '/bills', icon: <ReceiptIcon /> },
      { text: 'GST Sell Bills', path: '/gst-bills', icon: <ReceiptIcon /> },
      { text: 'Purchase GST Bills', path: '/purchase-gst-bills', icon: <ReceiptIcon /> },
    ],
  },
  {
    group: 'PARTIES & ACCOUNTS',
    items: [
      { text: 'Customers', path: '/customers', icon: <PeopleIcon /> },
      { text: 'GST Customers', path: '/gst-customers', icon: <PeopleIcon /> },
      { text: 'Purchase Suppliers', path: '/purchase-gst-suppliers', icon: <PeopleIcon /> },
    ],
  },
  {
    group: 'INVENTORY & LOGISTICS',
    items: [
      { text: 'Products Catalog', path: '/products', icon: <CategoryIcon /> },
      { text: 'Current Stock', path: '/current-stock', icon: <InventoryIcon /> },
      { text: 'Purchase Validation', path: '/purchase-validation', icon: <ShippingIcon /> },
      { text: 'Delivery Sectors', path: '/delivery-sectors', icon: <ShippingIcon /> },
      { text: 'Delivery Settlements', path: '/delivery-settlements', icon: <ShippingIcon /> },
    ],
  },
  {
    group: 'QUOTATION & REPORTS',
    items: [
      { text: 'Order Quotation', path: '/order-quotation', icon: <CalculateIcon /> },
      { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
      { text: 'Sales Analysis', path: '/analysis', icon: <AssessmentIcon /> },
    ],
  },
  {
    group: 'SYSTEM & TOOLS',
    items: [
      { text: 'Envelopes', path: '/envelope', icon: <MailIcon /> },
      { text: 'Backups', path: '/backups', icon: <BackupIcon /> },
      { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    ],
  },
];

export const allNavItems = navGroups.flatMap((g) => g.items);

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

  const getBottomNavValue = () => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/bills')) return '/bills';
    if (location.pathname.startsWith('/current-stock')) return '/current-stock';
    if (location.pathname.startsWith('/reports')) return '/reports';
    return 'more';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sleek Enterprise Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          {/* Brand Logo & Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
              }}
            >
              <InventoryIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#ffffff',
                  lineHeight: 1.1,
                }}
              >
                ELBAT
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                Stone & Marble ERP
              </Typography>
            </Box>
          </Box>

          {/* Status Indicators & Profile Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Live API status indicator */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'rgba(255,255,255,0.06)',
                px: 1.5,
                py: 0.5,
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CircleIcon sx={{ fontSize: 8, color: '#22c55e' }} />
              <Typography sx={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 500 }}>
                API Online
              </Typography>
            </Box>

            {/* Active Branch Badge */}
            <Chip
              label="dev"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            />

            {/* User Details */}
            {user && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255,255,255,0.05)',
                }}
              >
                <PeopleIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.8rem' }}>
                  {user.username || 'Admin'}
                </Typography>
              </Box>
            )}

            {/* Logout Action */}
            <IconButton
              onClick={logout}
              title="Logout"
              size="small"
              sx={{
                color: '#94a3b8',
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
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
              borderRight: '1px solid #e2e8f0',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflowY: 'auto', px: 2, py: 2.5 }}>
            {navGroups.map((group, groupIdx) => (
              <Box key={group.group} sx={{ mb: groupIdx === navGroups.length - 1 ? 0 : 2.5 }}>
                <Typography
                  sx={{
                    px: 1.5,
                    mb: 0.75,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '0.08em',
                  }}
                >
                  {group.group}
                </Typography>
                <List dense disablePadding>
                  {group.items.map((item) => {
                    const selected =
                      item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);
                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.4 }}>
                        <ListItemButton
                          selected={selected}
                          onClick={() => handleNavClick(item.path)}
                          sx={{
                            borderRadius: '8px',
                            py: 0.9,
                            px: 1.5,
                            transition: 'all 0.15s ease-in-out',
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
                              '& .MuiListItemIcon-root': { color: '#ffffff' },
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                              },
                            },
                            '&:not(.Mui-selected):hover': {
                              bgcolor: '#f1f5f9',
                              color: '#0f172a',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 32,
                              color: selected ? '#ffffff' : '#64748b',
                              '& svg': { fontSize: 19 },
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontSize: '0.84rem',
                                  fontWeight: selected ? 700 : 500,
                                  color: selected ? '#ffffff' : '#334155',
                                }}
                              >
                                {item.text}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          mb: isMobile ? '68px' : 0,
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>

      {/* Mobile Fixed Bottom Navigation */}
      {isMobile && (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.appBar,
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <BottomNavigation
            value={getBottomNavValue()}
            onChange={(_, newValue) => {
              if (newValue === 'more') {
                setMobileMenuOpen(true);
              } else {
                handleNavClick(newValue);
              }
            }}
            showLabels
            sx={{
              height: 60,
              '& .Mui-selected': {
                color: '#2563eb',
                '& .MuiBottomNavigationAction-label': { fontWeight: 700 },
              },
            }}
          >
            <BottomNavigationAction label="Home" value="/" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Bills" value="/bills" icon={<ReceiptIcon />} />
            <BottomNavigationAction label="Stock" value="/current-stock" icon={<InventoryIcon />} />
            <BottomNavigationAction label="Reports" value="/reports" icon={<AssessmentIcon />} />
            <BottomNavigationAction label="Menu" value="more" icon={<MoreIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile Menu Drawer (Small devices: box-type tiles with rounded-corner borders) */}
      <SwipeableDrawer
        anchor="bottom"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpen={() => setMobileMenuOpen(true)}
        sx={{
          zIndex: (t) => t.zIndex.modal + 1,
          [`& .MuiDrawer-paper`]: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '82vh',
            bgcolor: '#ffffff',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
          },
        }}
      >
        {/* Drawer Pull Handle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 44, height: 4, bgcolor: '#cbd5e1', borderRadius: 2 }} />
        </Box>

        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              All Modules & Applications
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Select a module to navigate
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Responsive Box-type Tiles Grid */}
        <Box sx={{ overflowY: 'auto', p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            {allNavItems.map((item) => {
              const selected =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
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
                    minHeight: 86,
                    p: 1.5,
                    border: '1.5px solid',
                    borderColor: selected ? '#2563eb' : '#e2e8f0',
                    borderRadius: 3,
                    bgcolor: selected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    boxShadow: selected ? '0 4px 10px rgba(37,99,235,0.15)' : 'none',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: selected ? '#eff6ff' : '#f8fafc',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: selected ? '#2563eb' : '#334155',
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
                      fontWeight: selected ? 700 : 600,
                      color: selected ? '#2563eb' : '#1e293b',
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
