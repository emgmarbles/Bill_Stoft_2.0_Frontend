import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#18181b',
      dark: '#09090b',
      light: '#27272a',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#f4f4f5',
      dark: '#e4e4e7',
      light: '#fafafa',
      contrastText: '#18181b',
    },
    success: {
      main: '#16a34a',
      dark: '#15803d',
      light: '#86efac',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ea580c',
      dark: '#c2410c',
      light: '#fdba74',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#fca5a5',
      contrastText: '#ffffff',
    },
    info: {
      main: '#18181b',
      dark: '#09090b',
      light: '#f4f4f5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#09090b',
      secondary: '#71717a',
      disabled: '#a1a1aa',
    },
    divider: '#e4e4e7',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: '#09090b',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#09090b',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: '#09090b',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#09090b',
    },
    h5: {
      fontWeight: 600,
      color: '#09090b',
    },
    h6: {
      fontWeight: 600,
      color: '#09090b',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#09090b',
    },
    subtitle2: {
      fontWeight: 500,
      color: '#71717a',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#09090b',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.4,
      color: '#71717a',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
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
          borderRadius: 6,
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        },
        containedPrimary: {
          backgroundColor: '#18181b',
          color: '#fafafa',
          border: '1px solid #18181b',
          '&:hover': {
            backgroundColor: '#27272a',
            borderColor: '#27272a',
          },
        },
        outlinedSecondary: {
          borderColor: '#e4e4e7',
          color: '#09090b',
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#f4f4f5',
            borderColor: '#d4d4d8',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e4e4e7',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          border: '1px solid #e4e4e7',
          backgroundColor: '#f4f4f5',
          color: '#18181b',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e4e4e7',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d4d4d8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#18181b',
            borderWidth: '1px',
            boxShadow: '0 0 0 1px #18181b',
          },
        },
      },
    },
  },
});

export default theme;
