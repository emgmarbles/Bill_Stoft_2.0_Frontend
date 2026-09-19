import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import GSTInvoiceList from './pages/gst/GSTInvoiceList';
import GSTCustomersPage from './pages/gst/GSTCustomersPage';
import GSTSuppliersPage from './pages/gst/GSTSuppliersPage';
import GSTProductsPage from './pages/gst/GSTProductsPage';

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: 'var(--text-main)' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>Module screen will be loaded here.</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Screens */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected ERP Modules */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/bills/*" element={<PlaceholderPage title="Local Sale Bills" />} />
                      <Route path="/gst-bills/*" element={<GSTInvoiceList type="sale" />} />
                      <Route path="/purchase-gst-bills/*" element={<GSTInvoiceList type="purchase" />} />
                      <Route path="/customers/*" element={<PlaceholderPage title="Customers" />} />
                      <Route path="/gst-customers/*" element={<GSTCustomersPage />} />
                      <Route path="/purchase-gst-suppliers/*" element={<GSTSuppliersPage />} />
                      <Route path="/gst-products/*" element={<GSTProductsPage />} />
                      <Route path="/products/*" element={<PlaceholderPage title="Products" />} />
                      <Route path="/current-stock/*" element={<PlaceholderPage title="Current Stock" />} />
                      <Route path="/purchase-validation/*" element={<PlaceholderPage title="Purchase Validation" />} />
                      <Route path="/delivery-sectors/*" element={<PlaceholderPage title="Delivery Sectors" />} />
                      <Route path="/delivery-settlements/*" element={<PlaceholderPage title="Delivery Settlements" />} />
                      <Route path="/order-quotation/*" element={<PlaceholderPage title="Order Quotation" />} />
                      <Route path="/reports/*" element={<PlaceholderPage title="Reports" />} />
                      <Route path="/analysis/*" element={<PlaceholderPage title="Sales Analysis" />} />
                      <Route path="/envelope/*" element={<PlaceholderPage title="Envelopes" />} />
                      <Route path="/backups/*" element={<PlaceholderPage title="Backups" />} />
                      <Route path="/settings/*" element={<PlaceholderPage title="Settings" />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
