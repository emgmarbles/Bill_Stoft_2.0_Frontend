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
        bgcolor: '#fafafa',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '8px',
              bgcolor: '#18181b',
              color: '#fafafa',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              mb: 1.5,
            }}
          >
            <InventoryIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>
            ELBAT ERP
          </Typography>
          <Typography variant="body2" sx={{ color: '#71717a', mt: 0.5 }}>
            Stone & Marble Trading Stock Management
          </Typography>
        </Box>

        {/* Login Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #e4e4e7',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em' }}>
                Sign In
              </Typography>
              <Chip
                label="Enterprise 2.0"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  bgcolor: '#f4f4f5',
                  color: '#18181b',
                  border: '1px solid #e4e4e7',
                }}
              />
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5, fontSize: '0.85rem' }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 500, color: '#09090b' }}>
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
                        borderRadius: '6px',
                        '& fieldset': { borderColor: '#e4e4e7' },
                        '&:hover fieldset': { borderColor: '#a1a1aa' },
                        '&.Mui-focused fieldset': { borderColor: '#18181b', borderWidth: '1px' },
                      },
                    }}
                  />
                </div>

                <div>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#09090b' }}>
                      Password
                    </Typography>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#71717a',
                        textDecoration: 'underline',
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
                        borderRadius: '6px',
                        '& fieldset': { borderColor: '#e4e4e7' },
                        '&:hover fieldset': { borderColor: '#a1a1aa' },
                        '&.Mui-focused fieldset': { borderColor: '#18181b', borderWidth: '1px' },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#71717a' }}
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
                      sx={{ color: '#a1a1aa', '&.Mui-checked': { color: '#18181b' } }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ color: '#71717a', fontWeight: 400 }}>Remember this device for 30 days</Typography>}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <LockIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    mt: 1,
                    py: 1,
                    borderRadius: '6px',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    bgcolor: '#18181b',
                    color: '#fafafa',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#27272a',
                      boxShadow: 'none',
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
                pt: 2,
                borderTop: '1px solid #e4e4e7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="caption" sx={{ color: '#71717a' }}>
                Testing access?
              </Typography>
              <Button
                size="small"
                onClick={handleFillDemo}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#71717a',
                  '&:hover': { bgcolor: '#f4f4f5', color: '#09090b' },
                }}
              >
                Auto-fill Admin Demo
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Footer info */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: '#71717a', fontSize: '0.75rem' }}>
            ELBAT Stones &copy; {new Date().getFullYear()} · Strictly authorized access only
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
