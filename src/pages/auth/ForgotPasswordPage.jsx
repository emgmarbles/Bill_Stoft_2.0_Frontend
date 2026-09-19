import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import authService from '../../services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Set New Password, 3 = Done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(email.trim().toLowerCase());
      setSuccessMsg(`Verification code sent to ${email.trim()}`);
      setStep(2);
    } catch (err) {
      console.error('Send OTP error', err);
      const detail =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to send OTP. Please check your email or contact system administrator.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      setStep(3);
    } catch (err) {
      console.error('Reset password error', err);
      const detail =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to reset password. Please verify the OTP code.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f172a',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(37, 71, 235, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 71, 235, 0.1) 0px, transparent 50%)',
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
            Account Password Recovery
          </Typography>
        </Box>

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
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && step === 2 && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }}>
                {successMsg}
              </Alert>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <div>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Reset Password
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: '0.875rem' }}>
                  Enter your email address and we&apos;ll send a one-time verification code to recover your account.
                </Typography>

                <form onSubmit={handleRequestOtp}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 600, color: '#334155' }}>
                        Registered Email Address
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&.Mui-focused fieldset': { borderColor: '#2547eb' },
                          },
                        }}
                      />
                    </div>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <KeyIcon />}
                      sx={{
                        mt: 1,
                        py: 1.2,
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        bgcolor: '#2547eb',
                        boxShadow: '0 4px 12px rgba(37, 71, 235, 0.3)',
                        '&:hover': { bgcolor: '#1d4ed8' },
                      }}
                    >
                      {loading ? 'Sending Code...' : 'Send Recovery Code'}
                    </Button>

                    <Button
                      component={Link}
                      to="/login"
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        textTransform: 'none',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        mt: 1,
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </Box>
                </form>
              </div>
            )}

            {/* Step 2: Verify OTP & Enter New Password */}
            {step === 2 && (
              <div>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Enter Verification Code
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.875rem' }}>
                  Please enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.
                </Typography>

                <form onSubmit={handleResetPassword}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 600, color: '#334155' }}>
                        Verification Code (OTP)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        autoFocus
                        size="small"
                        inputProps={{ maxLength: 6 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            letterSpacing: '0.2em',
                            fontWeight: 700,
                            '&.Mui-focused fieldset': { borderColor: '#2547eb' },
                          },
                        }}
                      />
                    </div>

                    <div>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 600, color: '#334155' }}>
                        New Password
                      </Typography>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
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

                    <div>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, fontWeight: 600, color: '#334155' }}>
                        Confirm New Password
                      </Typography>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&.Mui-focused fieldset': { borderColor: '#2547eb' },
                          },
                        }}
                      />
                    </div>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                      sx={{
                        mt: 1,
                        py: 1.2,
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        bgcolor: '#2547eb',
                        boxShadow: '0 4px 12px rgba(37, 71, 235, 0.3)',
                        '&:hover': { bgcolor: '#1d4ed8' },
                      }}
                    >
                      {loading ? 'Updating Password...' : 'Save New Password'}
                    </Button>

                    <Button
                      onClick={() => setStep(1)}
                      sx={{
                        textTransform: 'none',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      Resend Code / Change Email
                    </Button>
                  </Box>
                </form>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 3 && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 56, color: '#16a34a', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Password Reset Successfully
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  Your password has been changed. You can now sign in with your new credentials.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.2,
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    bgcolor: '#2547eb',
                    '&:hover': { bgcolor: '#1d4ed8' },
                  }}
                >
                  Proceed to Sign In
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
