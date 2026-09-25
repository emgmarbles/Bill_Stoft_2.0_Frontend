import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'primereact/api',
      'primereact/dialog',
      'primereact/button',
      'primereact/inputtext',
      'primereact/dropdown',
      'primereact/inputnumber',
      'primereact/calendar',
      'primereact/checkbox',
      'primereact/datatable',
      'primereact/column',
      'primereact/tag',
      'primereact/toast',
      'primereact/divider',
      'primereact/accordion',
      'axios',
    ],
  },
});
