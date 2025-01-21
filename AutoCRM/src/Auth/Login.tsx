import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  Alert,
  InputAdornment,
  Link
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { Check, Close } from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);

  const passwordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (resetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setError('Check your email for password reset instructions');
        return;
      }

      if (isSignUp) {
        if (!passwordsMatch) {
          throw new Error('Passwords do not match');
        }
        const result = await supabase.auth.signUp({
          email,
          password,
        });
        if (result.error) throw result.error;
        if (result.data?.user) {
          setError('Please check your email to confirm your account');
        }
      } else {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (result.error) throw result.error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            {resetPassword ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity={error.includes('check your email') ? 'info' : 'error'} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            {!resetPassword && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {isSignUp && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: password && (
                    <InputAdornment position="end">
                      {passwordsMatch ? (
                        <Check color="success" />
                      ) : (
                        <Close color="error" />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || (isSignUp && !passwordsMatch)}
            >
              {loading ? 'Processing...' : (
                resetPassword ? 'Send Reset Instructions' : (isSignUp ? 'Sign Up' : 'Sign In')
              )}
            </Button>

            {!resetPassword && (
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
                sx={{ mt: 1 }}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            )}

            {!isSignUp && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setResetPassword(!resetPassword);
                    setError(null);
                    setPassword('');
                  }}
                >
                  {resetPassword ? 'Back to Sign In' : 'Forgot password?'}
                </Link>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
