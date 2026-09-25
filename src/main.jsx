import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';
import App from './App.jsx';

const primeReactConfig = {
  ripple: true,
  zIndex: {
    modal: 2500,
    overlay: 3000,
    menu: 3000,
    tooltip: 3100,
    toast: 3200,
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider value={primeReactConfig}>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
);
