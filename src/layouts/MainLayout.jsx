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
  Tooltip,
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
  MoreHoriz as MoreIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 270;
const COLLAPSED_DRAWER_WIDTH = 72;

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
      { text: 'All GST Invoices', path: '/all-gst-bills', icon: <ReceiptIcon /> },
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
      { text: 'GST Products', path: '/gst-products', icon: <CategoryIcon /> },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentDrawerWidth = sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Sleek Enterprise Top AppBar (shadcn/ui aesthetic) */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: '#ffffff',
          color: '#09090b',
          borderBottom: '1px solid #e4e4e7',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          {/* Brand Logo & Name with Collapse Sidebar Trigger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={isMobile ? "Menu" : (sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar")} arrow>
              <IconButton
                onClick={(e) => {
                  e.currentTarget.blur();
                  if (isMobile) {
                    setMobileMenuOpen(true);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                sx={{
                  p: 0,
                  borderRadius: '6px',
                  transition: 'opacity 0.15s ease-in-out',
                  '&:hover': { opacity: 0.85 },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '6px',
                    bgcolor: '#18181b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fafafa',
                    cursor: 'pointer',
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 18 }} />
                </Box>
              </IconButton>
            </Tooltip>
            <Box
              onClick={() => {
                if (!isMobile) setSidebarCollapsed(!sidebarCollapsed);
              }}
              sx={{ cursor: isMobile ? 'default' : 'pointer', userSelect: 'none' }}
            >
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#09090b',
                  lineHeight: 1.1,
                  fontSize: '0.95rem',
                }}
              >
                ELBAT
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#71717a',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                Stone & Marble ERP
              </Typography>
            </Box>
          </Box>

          {/* Status Indicators & Profile Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {/* Live API status indicator */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.75,
                bgcolor: '#f4f4f5',
                px: 1.25,
                py: 0.4,
                borderRadius: '6px',
                border: '1px solid #e4e4e7',
              }}
            >
              <CircleIcon sx={{ fontSize: 7, color: '#16a34a' }} />
              <Typography sx={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 500 }}>
                API Online
              </Typography>
            </Box>

            {/* Active Branch Badge */}
            <Chip
              label="dev"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: '#f4f4f5',
                color: '#71717a',
                border: '1px solid #e4e4e7',
                borderRadius: '6px',
              }}
            />

            {/* User Details */}
            {user && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: '#f4f4f5',
                  border: '1px solid #e4e4e7',
                }}
              >
                <PeopleIcon sx={{ fontSize: 15, color: '#71717a' }} />
                <Typography variant="body2" sx={{ color: '#18181b', fontWeight: 500, fontSize: '0.78rem' }}>
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
                color: '#71717a',
                borderRadius: '6px',
                p: 0.75,
                '&:hover': { color: '#09090b', bgcolor: '#f4f4f5' },
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar (Medium and larger screens) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            transition: 'width 0.2s ease-in-out',
            [`& .MuiDrawer-paper`]: {
              width: currentDrawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#ffffff',
              borderRight: '1px solid #e4e4e7',
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflowY: 'auto', px: sidebarCollapsed ? 1 : 1.5, py: 2, transition: 'padding 0.2s' }}>
            {navGroups.map((group, groupIdx) => (
              <Box key={group.group} sx={{ mb: groupIdx === navGroups.length - 1 ? 0 : (sidebarCollapsed ? 1.5 : 2) }}>
                {!sidebarCollapsed ? (
                  <Typography
                    sx={{
                      px: 1.25,
                      mb: 0.5,
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#a1a1aa',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {group.group}
                  </Typography>
                ) : (
                  groupIdx > 0 && <Divider sx={{ my: 1, borderColor: '#f4f4f5' }} />
                )}
                <List dense disablePadding>
                  {group.items.map((item) => {
                    const selected =
                      item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);

                    const buttonContent = (
                      <ListItemButton
                        selected={selected}
                        onClick={() => handleNavClick(item.path)}
                        sx={{
                          borderRadius: '6px',
                          py: 0.75,
                          px: sidebarCollapsed ? 1 : 1.25,
                          justifyContent: sidebarCollapsed ? 'center' : 'initial',
                          transition: 'all 0.12s ease-in-out',
                          '&.Mui-selected': {
                            backgroundColor: '#f4f4f5',
                            color: '#18181b',
                            '& .MuiListItemIcon-root': { color: '#18181b' },
                            '&:hover': {
                              backgroundColor: '#e4e4e7',
                            },
                          },
                          '&:not(.Mui-selected):hover': {
                            bgcolor: '#fafafa',
                            color: '#09090b',
                            '& .MuiListItemIcon-root': { color: '#09090b' },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: sidebarCollapsed ? 'auto' : 30,
                            justifyContent: 'center',
                            color: selected ? '#18181b' : '#71717a',
                            '& svg': { fontSize: 18 },
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!sidebarCollapsed && (
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontSize: '0.8125rem',
                                  fontWeight: selected ? 600 : 500,
                                  color: selected ? '#18181b' : '#52525b',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.text}
                              </Typography>
                            }
                          />
                        )}
                      </ListItemButton>
                    );

                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                        {sidebarCollapsed ? (
                          <Tooltip title={item.text} placement="right" arrow>
                            {buttonContent}
                          </Tooltip>
                        ) : (
                          buttonContent
                        )}
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
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: 'width 0.2s ease-in-out',
          mt: '64px',
          mb: isMobile ? '68px' : 0,
          overflowX: 'hidden',
          bgcolor: '#fafafa',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>

      {/* Mobile Fixed Bottom Navigation */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.appBar,
            borderTop: '1px solid #e4e4e7',
            bgcolor: '#ffffff',
          }}
        >
          <BottomNavigation
            value={getBottomNavValue()}
            onChange={(_, newValue) => {
              if (newValue === 'more') {
                document.activeElement?.blur();
                setMobileMenuOpen(true);
              } else {
                handleNavClick(newValue);
              }
            }}
            showLabels
            sx={{
              height: 56,
              bgcolor: '#ffffff',
              '& .Mui-selected': {
                color: '#18181b',
                '& .MuiBottomNavigationAction-label': { fontWeight: 600, fontSize: '0.72rem' },
              },
              '& .MuiBottomNavigationAction-root': {
                color: '#71717a',
              },
            }}
          >
            <BottomNavigationAction label="Home" value="/" icon={<DashboardIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Bills" value="/bills" icon={<ReceiptIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Stock" value="/current-stock" icon={<InventoryIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Reports" value="/reports" icon={<AssessmentIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Menu" value="more" icon={<MoreIcon sx={{ fontSize: 20 }} />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile Menu Drawer (Small devices: box-type tiles with rounded-corner borders) */}
      <SwipeableDrawer
        anchor="bottom"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpen={() => {
          document.activeElement?.blur();
          setMobileMenuOpen(true);
        }}
        disableRestoreFocus
        autoFocus
        sx={{
          zIndex: (t) => t.zIndex.modal + 1,
          [`& .MuiDrawer-paper`]: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '82vh',
            bgcolor: '#ffffff',
            borderTop: '1px solid #e4e4e7',
            boxShadow: '0 -8px 20px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Drawer Pull Handle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, bgcolor: '#e4e4e7', borderRadius: 2 }} />
        </Box>

        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid #e4e4e7',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em' }}>
              All Modules & Applications
            </Typography>
            <Typography variant="caption" sx={{ color: '#71717a' }}>
              Select a module to navigate
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setMobileMenuOpen(false)} sx={{ color: '#71717a' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Responsive Box-type Tiles Grid */}
        <Box sx={{ overflowY: 'auto', p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.25,
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
                    minHeight: 82,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: selected ? '#18181b' : '#e4e4e7',
                    borderRadius: 2,
                    bgcolor: selected ? '#f4f4f5' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    boxShadow: selected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    '&:hover': {
                      borderColor: '#18181b',
                      bgcolor: '#f4f4f5',
                    },
                    '&:active': {
                      transform: 'scale(0.97)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: selected ? '#18181b' : '#71717a',
                      mb: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': { fontSize: 24 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: selected ? 600 : 500,
                      color: selected ? '#18181b' : '#09090b',
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

