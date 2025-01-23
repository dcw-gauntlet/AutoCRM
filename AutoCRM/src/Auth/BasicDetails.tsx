import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  Alert
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { client } from '../client';

interface BasicDetailsProps {
  onComplete: () => void;
}

export default function BasicDetails({ onComplete }: BasicDetailsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    friendlyName: '',
  });

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if profile already exists
    try {
      const profile = await client.getUserProfile(user.id);
      if (profile) {
        navigate('/dashboard'); // Profile exists, redirect to dashboard
      }
    } catch (err) {
      // Profile doesn't exist, stay on this page
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      await client.createUserProfile({
        user_id: user.id,
        email: user.email!,
        full_name: formData.fullName,
        friendly_name: formData.friendlyName,
        avatar: undefined
      });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Complete Your Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Display Name (optional)"
              name="friendlyName"
              value={formData.friendlyName}
              onChange={(e) => setFormData(prev => ({ ...prev, friendlyName: e.target.value }))}
              helperText="This is how you'll appear to others"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading || !formData.fullName}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
