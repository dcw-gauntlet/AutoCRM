import { Box, Typography, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function EmailVerificationSuccess() {
    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ 
                    fontSize: 64, 
                    color: 'success.main',
                    mb: 2 
                }} />
                <Typography variant="h5" gutterBottom>
                    Email Verified Successfully!
                </Typography>
                <Typography color="text.secondary">
                    You can now close this tab and return to the signup process.
                </Typography>
            </Paper>
        </Box>
    );
} 