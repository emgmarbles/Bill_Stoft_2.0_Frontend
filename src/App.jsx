import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';

function PlaceholderPage({ title }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>Module screen will be loaded here.</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills/*" element={<PlaceholderPage title="Local Sale Bills" />} />
              <Route path="/gst-bills/*" element={<PlaceholderPage title="GST Sell Bills" />} />
              <Route path="/purchase-gst-bills/*" element={<PlaceholderPage title="Purchase GST Bills" />} />
              <Route path="/customers/*" element={<PlaceholderPage title="Customers" />} />
              <Route path="/gst-customers/*" element={<PlaceholderPage title="GST Customers" />} />
              <Route path="/purchase-gst-suppliers/*" element={<PlaceholderPage title="Purchase Suppliers" />} />
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
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
