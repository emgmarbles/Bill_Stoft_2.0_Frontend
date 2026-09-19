import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Inventory as InventoryIcon,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email.trim().toLowerCase(), password, rememberMe);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login submit error', err);
      setErrorMessage('Network or server connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@elbat.com');
    setPassword('Admin@123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f172a',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 71, 235, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 71, 235, 0.1) 0px, transparent 50%)',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '12px',
              bgcolor: '#2547eb',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 71, 235, 0.4)',
              mb: 1.5,
            }}
          >
            <InventoryIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            ELBAT ERP
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Stone & Marble Trading Stock Management
          </Typography>
        </Box>

        {/* Login Card */}
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            border: '1px solid #1e293b',
            bgcolor: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Sign In
              </Typography>
              <Chip label="Enterprise 2.0" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#eff4ff', color: '#2547eb' }} />
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 600, color: '#334155' }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': { borderColor: '#2547eb' },
                      },
                    }}
                  />
                </div>

                <div>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                      Password
                    </Typography>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#2547eb',
                        textDecoration: 'none',
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': { borderColor: '#2547eb' },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#94a3b8' }}
                          >
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#2547eb' } }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>Remember this device for 30 days</Typography>}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
                  sx={{
                    mt: 1,
                    py: 1.2,
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    bgcolor: '#2547eb',
                    boxShadow: '0 4px 12px rgba(37, 71, 235, 0.3)',
                    '&:hover': {
                      bgcolor: '#1d4ed8',
                      boxShadow: '0 6px 16px rgba(37, 71, 235, 0.4)',
                    },
                  }}
                >
                  {submitting ? 'Authenticating...' : 'Sign In to ERP'}
                </Button>
              </Box>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Testing access?
              </Typography>
              <Button
                size="small"
                onClick={handleFillDemo}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
                }}
              >
                Auto-fill Admin Demo
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Footer info */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
            ELBAT Stones &copy; {new Date().getFullYear()} · Strictly authorized access only
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
