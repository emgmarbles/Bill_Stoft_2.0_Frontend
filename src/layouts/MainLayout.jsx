import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  ChevronRight as ChevronRightIcon,
  UnfoldMore as UnfoldMoreIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 68;

// shadcn/ui SidebarLeft icon (panel-left)
function SidebarLeftIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

const navGroups = [
  {
    group: 'Platform',
    items: [
      { text: 'Dashboard', path: '/', icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
    ],
  },
  {
    group: 'Sales & Invoicing',
    items: [
      { text: 'Local Sale Bills', path: '/bills', icon: <ReceiptIcon sx={{ fontSize: 18 }} /> },
      {
        text: 'GST Billing',
        icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
        subItems: [
          { text: 'GST Sell Bills', path: '/gst-bills' },
          { text: 'Purchase GST Bills', path: '/purchase-gst-bills' },
          { text: 'All GST Invoices', path: '/all-gst-bills' },
          { text: 'GST Stock & Balance', path: '/gst-stock' },
        ],
      },
    ],
  },
  {
    group: 'Parties & Accounts',
    items: [
      {
        text: 'Parties',
        icon: <PeopleIcon sx={{ fontSize: 18 }} />,
        subItems: [
          { text: 'Customers', path: '/customers' },
          { text: 'GST Customers', path: '/gst-customers' },
          { text: 'Purchase Suppliers', path: '/purchase-gst-suppliers' },
        ],
      },
    ],
  },
  {
    group: 'Inventory & Logistics',
    items: [
      {
        text: 'Products & Stock',
        icon: <CategoryIcon sx={{ fontSize: 18 }} />,
        subItems: [
          { text: 'Products Catalog', path: '/products' },
          { text: 'GST Products', path: '/gst-products' },
          { text: 'Current Stock', path: '/current-stock' },
          { text: 'Product Rates', path: '/current-rates' },
        ],
      },
      {
        text: 'Logistics',
        icon: <ShippingIcon sx={{ fontSize: 18 }} />,
        subItems: [
          { text: 'Purchase Validation', path: '/purchase-validation' },
          { text: 'Delivery Sectors', path: '/delivery-sectors' },
          { text: 'Delivery Settlements', path: '/delivery-settlements' },
        ],
      },
    ],
  },
  {
    group: 'Quotations & Reports',
    items: [
      { text: 'Order Quotation', path: '/order-quotation', icon: <CalculateIcon sx={{ fontSize: 18 }} /> },
      {
        text: 'Reports & Analytics',
        icon: <AssessmentIcon sx={{ fontSize: 18 }} />,
        subItems: [
          { text: 'Reports', path: '/reports' },
          { text: 'Sales Analysis', path: '/analysis' },
        ],
      },
    ],
  },
  {
    group: 'System & Tools',
    items: [
      { text: 'Envelopes', path: '/envelope', icon: <MailIcon sx={{ fontSize: 18 }} /> },
      { text: 'Backups', path: '/backups', icon: <BackupIcon sx={{ fontSize: 18 }} /> },
      { text: 'Settings', path: '/settings', icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
    ],
  },
];

// Flat items for mobile drawer box tiles & lookup
const allNavItems = navGroups.flatMap((g) =>
  g.items.flatMap((item) =>
    item.subItems
      ? item.subItems.map((sub) => ({
          ...sub,
          icon: item.icon,
          group: g.group,
        }))
      : [{ ...item, group: g.group }]
  )
);

export default function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState({
    'GST Billing': true,
    Parties: true,
    'Products & Stock': false,
    Logistics: false,
    'Reports & Analytics': false,
  });

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Auto-expand collapsible parent if current route matches child
  useEffect(() => {
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.subItems) {
          const isChildActive = item.subItems.some((sub) =>
            location.pathname.startsWith(sub.path)
          );
          if (isChildActive) {
            setOpenCollapsibles((prev) => ({ ...prev, [item.text]: true }));
          }
        }
      });
    });
  }, [location.pathname]);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar on desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !isMobile) {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const toggleCollapsible = (title) => {
    setOpenCollapsibles((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const getBottomNavValue = () => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/bills')) return '/bills';
    if (location.pathname.startsWith('/current-stock')) return '/current-stock';
    if (location.pathname.startsWith('/reports')) return '/reports';
    return 'more';
  };

  // Derive current page title for breadcrumb
  const currentItem = allNavItems.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/' && location.pathname.startsWith(item.path))
  );

  const currentDrawerWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* ======================================================== */}
      {/* 1. DESKTOP SHADCN/UI SIDEBAR (Large screens only)       */}
      {/* ======================================================== */}
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            width: currentDrawerWidth,
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            bgcolor: '#09090b',
            color: '#fafafa',
            borderRight: '1px solid #27272a',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1200,
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* Workspace / Org Switcher Header */}
          <Box
            sx={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              px: sidebarCollapsed ? 1 : 1.75,
              borderBottom: '1px solid #27272a',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#18181b' },
            }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#18181b',
                  border: '1px solid #27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fafafa',
                  flexShrink: 0,
                }}
              >
                <InventoryIcon sx={{ fontSize: 17, color: '#38bdf8' }} />
              </Box>
              {!sidebarCollapsed && (
                <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#fafafa',
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    ELBAT
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: '#71717a',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    Stone & Marble ERP
                  </Typography>
                </Box>
              )}
            </Box>
            {!sidebarCollapsed && (
              <UnfoldMoreIcon sx={{ fontSize: 16, color: '#71717a', flexShrink: 0 }} />
            )}
          </Box>

          {/* Nav Items Section (Scrollable) */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              py: 1.5,
              px: sidebarCollapsed ? 0.75 : 1.25,
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#27272a',
                borderRadius: '4px',
              },
            }}
          >
            {navGroups.map((group, groupIdx) => (
              <Box key={group.group} sx={{ mb: 1.5 }}>
                {/* Group Label */}
                {!sidebarCollapsed ? (
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#71717a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      px: 1,
                      py: 0.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {group.group}
                  </Typography>
                ) : (
                  groupIdx > 0 && <Divider sx={{ my: 1, borderColor: '#27272a' }} />
                )}

                {/* Items */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {group.items.map((item) => {
                    const hasSub = Boolean(item.subItems);
                    const isOpen = openCollapsibles[item.text];
                    const isAnyChildActive =
                      hasSub &&
                      item.subItems.some((sub) => location.pathname.startsWith(sub.path));
                    const isDirectActive =
                      !hasSub &&
                      (item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path));

                    if (sidebarCollapsed) {
                      // Collapsed Rail View: Icons only with Tooltip
                      return (
                        <Tooltip
                          key={item.text}
                          title={item.text}
                          placement="right"
                          arrow
                        >
                          <Box
                            onClick={() => {
                              if (hasSub) {
                                handleNavClick(item.subItems[0].path);
                              } else {
                                handleNavClick(item.path);
                              }
                            }}
                            sx={{
                              width: 44,
                              height: 38,
                              mx: 'auto',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: isDirectActive || isAnyChildActive ? '#fafafa' : '#a1a1aa',
                              bgcolor:
                                isDirectActive || isAnyChildActive ? '#27272a' : 'transparent',
                              transition: 'all 0.12s ease',
                              '&:hover': {
                                bgcolor: isDirectActive || isAnyChildActive ? '#27272a' : '#18181b',
                                color: '#fafafa',
                              },
                            }}
                          >
                            {item.icon}
                          </Box>
                        </Tooltip>
                      );
                    }

                    // Expanded View: Full shadcn Collapsible Tree Item
                    if (hasSub) {
                      return (
                        <Box key={item.text} sx={{ mb: 0.25 }}>
                          {/* Parent Button */}
                          <Box
                            onClick={() => toggleCollapsible(item.text)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              px: 1.25,
                              py: 0.75,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: isAnyChildActive ? '#fafafa' : '#d4d4d8',
                              fontWeight: isAnyChildActive ? 600 : 500,
                              fontSize: '0.82rem',
                              transition: 'all 0.12s ease',
                              '&:hover': {
                                bgcolor: '#18181b',
                                color: '#fafafa',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ display: 'flex', color: isAnyChildActive ? '#fafafa' : '#a1a1aa' }}>
                                {item.icon}
                              </Box>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 'inherit', color: 'inherit' }}>
                                {item.text}
                              </Typography>
                            </Box>
                            <ChevronRightIcon
                              sx={{
                                fontSize: 16,
                                color: '#71717a',
                                transform: isOpen ? 'rotate(90deg)' : 'none',
                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                            />
                          </Box>

                          {/* Subitems Tree with Guide Line */}
                          {isOpen && (
                            <Box
                              sx={{
                                ml: '19px',
                                pl: 1.25,
                                mt: 0.25,
                                borderLeft: '1px solid #27272a',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.25,
                              }}
                            >
                              {item.subItems.map((sub) => {
                                const isSubActive =
                                  sub.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(sub.path);
                                return (
                                  <Box
                                    key={sub.path}
                                    onClick={() => handleNavClick(sub.path)}
                                    sx={{
                                      px: 1,
                                      py: 0.6,
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: isSubActive ? 600 : 400,
                                      color: isSubActive ? '#fafafa' : '#a1a1aa',
                                      bgcolor: isSubActive ? '#27272a' : 'transparent',
                                      cursor: 'pointer',
                                      transition: 'all 0.12s ease',
                                      '&:hover': {
                                        bgcolor: isSubActive ? '#27272a' : '#18181b',
                                        color: '#fafafa',
                                      },
                                    }}
                                  >
                                    {sub.text}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </Box>
                      );
                    }

                    // Direct Nav Link
                    return (
                      <Box
                        key={item.text}
                        onClick={() => handleNavClick(item.path)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: isDirectActive ? '#fafafa' : '#d4d4d8',
                          bgcolor: isDirectActive ? '#27272a' : 'transparent',
                          fontWeight: isDirectActive ? 600 : 500,
                          fontSize: '0.82rem',
                          transition: 'all 0.12s ease',
                          '&:hover': {
                            bgcolor: isDirectActive ? '#27272a' : '#18181b',
                            color: '#fafafa',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', color: isDirectActive ? '#fafafa' : '#a1a1aa' }}>
                          {item.icon}
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 'inherit', color: 'inherit' }}>
                          {item.text}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>

          {/* User Profile Card Footer */}
          <Box
            sx={{
              borderTop: '1px solid #27272a',
              p: sidebarCollapsed ? 0.75 : 1,
              bgcolor: '#09090b',
            }}
          >
            <Box
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                p: sidebarCollapsed ? 0.5 : 1,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#18181b' },
              }}
              title="User account"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#27272a',
                    color: '#fafafa',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid #3f3f46',
                  }}
                >
                  {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                {!sidebarCollapsed && (
                  <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        color: '#fafafa',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {user?.username || 'Admin'}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: '#71717a',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {user?.email || 'admin@elbat.com'}
                    </Typography>
                  </Box>
                )}
              </Box>
              {!sidebarCollapsed && (
                <UnfoldMoreIcon sx={{ fontSize: 16, color: '#71717a', flexShrink: 0 }} />
              )}
            </Box>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: '#18181b',
                    color: '#fafafa',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                    minWidth: 190,
                    p: 0.5,
                  },
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #27272a', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#fafafa' }}>
                  {user?.username || 'Admin'}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#71717a' }}>
                  {user?.role || 'Super Admin'}
                </Typography>
              </Box>
              <MenuItem
                onClick={() => {
                  setUserMenuAnchor(null);
                  navigate('/settings');
                }}
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: '#d4d4d8',
                  '&:hover': { bgcolor: '#27272a', color: '#fafafa' },
                }}
              >
                <ListItemIcon sx={{ color: '#a1a1aa', minWidth: 28 }}>
                  <SettingsIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.82rem' }} />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setUserMenuAnchor(null);
                  logout();
                }}
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: '#ef4444',
                  '&:hover': { bgcolor: '#27272a', color: '#ef4444' },
                }}
              >
                <ListItemIcon sx={{ color: '#ef4444', minWidth: 28 }}>
                  <LogoutIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText primary="Log out" primaryTypographyProps={{ fontSize: '0.82rem' }} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 2. MOBILE TOPBAR (Small & Medium screens only)          */}
      {/* ======================================================== */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            zIndex: 1100,
          }}
        >
          <Box
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                bgcolor: '#18181b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fafafa',
              }}
            >
              <InventoryIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#09090b', lineHeight: 1.1 }}>
                ELBAT
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#71717a' }}>
                Stone & Marble ERP
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label="dev"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 600,
                bgcolor: '#f4f4f5',
                color: '#71717a',
                border: '1px solid #e4e4e7',
                borderRadius: '4px',
              }}
            />
            <IconButton
              onClick={logout}
              size="small"
              sx={{ color: '#71717a', p: 0.5 }}
              title="Logout"
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN CONTENT INSET AREA                              */}
      {/* ======================================================== */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          ml: { xs: 0, md: `${currentDrawerWidth}px` },
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          bgcolor: '#fafafa',
        }}
      >
        {/* Desktop Header bar (Contains shadcn [ | ] toggle button ONLY on large screen) */}
        {!isMobile && (
          <Box
            component="header"
            sx={{
              height: 52,
              position: 'sticky',
              top: 0,
              bgcolor: '#ffffff',
              borderBottom: '1px solid #e4e4e7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              zIndex: 100,
            }}
          >
            {/* Left: shadcn SidebarTrigger toggle button + Breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Toggle button ONLY for large screen */}
              <Tooltip
                title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
                arrow
              >
                <IconButton
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '6px',
                    border: '1px solid #e4e4e7',
                    bgcolor: '#ffffff',
                    color: '#09090b',
                    p: 0,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: '#f4f4f5',
                      borderColor: '#d4d4d8',
                    },
                  }}
                >
                  <SidebarLeftIcon />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.25, borderColor: '#e4e4e7' }} />

              {/* Breadcrumb / Section Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#71717a' }}>
                  {currentItem?.group || 'Application'}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#a1a1aa' }}>/</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#09090b' }}>
                  {currentItem?.text || 'Dashboard'}
                </Typography>
              </Box>
            </Box>

            {/* Right: API status & Active Branch */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  display: 'flex',
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

              {user && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: '6px',
                    bgcolor: '#f4f4f5',
                    border: '1px solid #e4e4e7',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#18181b', fontWeight: 500, fontSize: '0.78rem' }}>
                    {user.username || 'Admin'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Content Body */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 3.5 },
            mt: isMobile ? '56px' : 0,
            mb: isMobile ? '68px' : 0,
            bgcolor: '#fafafa',
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* 4. MOBILE BOTTOM NAVIGATION (Small & Medium screens only) */}
      {/* ======================================================== */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
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

      {/* ======================================================== */}
      {/* 5. MOBILE MENU DRAWER (Box-type tiles with rounded-corners) */}
      {/* ======================================================== */}
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
