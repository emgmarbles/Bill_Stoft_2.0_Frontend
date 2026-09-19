import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2547eb',
      dark: '#1d4ed8',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f172a',
      dark: '#020617',
      light: '#334155',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      dark: '#047857',
      light: '#34d399',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      dark: '#b45309',
      light: '#fbbf24',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e11d48',
      dark: '#be123c',
      light: '#f43f5e',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2547eb',
      light: '#eff6ff',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: '#0f172a',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: '#0f172a',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0f172a',
    },
    h5: {
      fontWeight: 600,
      color: '#0f172a',
    },
    h6: {
      fontWeight: 600,
      color: '#0f172a',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#0f172a',
    },
    subtitle2: {
      fontWeight: 500,
      color: '#64748b',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#0f172a',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.4,
      color: '#64748b',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(37, 71, 235, 0.2)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2547eb',
          '&:hover': {
            backgroundColor: '#1d4ed8',
          },
        },
        outlinedSecondary: {
          borderColor: '#cbd5e1',
          color: '#0f172a',
          '&:hover': {
            backgroundColor: '#f8fafc',
            borderColor: '#94a3b8',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2547eb',
            borderWidth: '2px',
          },
        },
      },
    },
  },
});

export default theme;
