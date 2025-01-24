import { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Button, 
    Stack, 
    TextField, 
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    CardActionArea,
    Alert,
    CircularProgress
} from '@mui/material';
import { AutoCRM, User, UserRole } from '../AutoCRM';
import SupportIcon from '@mui/icons-material/Support';
import BuildIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import RefreshIcon from '@mui/icons-material/Refresh';

interface WelcomeProps {
    autoCRM: AutoCRM;
    setCurrentUser: (user: User | null) => void;
}

export function Welcome({ autoCRM, setCurrentUser }: WelcomeProps) {
    const [mode, setMode] = useState<'choose' | 'login' | 'signup'>('choose');
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Auth states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Profile states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Clear any stale sessions on mount
    useEffect(() => {
        const cleanup = async () => {
            try {
                const user = await autoCRM.getCurrentUser();
                if (user) {
                    // If we have a user in auth but can't find them in the database
                    const dbUser = await autoCRM.getUser(user.id);
                    if (!dbUser) {
                        await autoCRM.signOut();
                        // Force reload to clear any cached auth state
                        window.location.reload();
                    }
                }
            } catch (error) {
                // If we get any errors, just sign out and reload
                await autoCRM.signOut();
                window.location.reload();
            }
        };
        cleanup();

        // Cleanup the interval when component unmounts
        return () => {
            cleanup();
        };
    }, []);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

    const handleLogin = async () => {
        try {
            const user = await autoCRM.login(email, password);
            setCurrentUser(user);
            navigate('/');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleInitialSignup = async () => {
        try {
            console.log('Starting signup process...');
            const { user, session } = await autoCRM.initiateSignup(email, password);
            console.log('Signup successful, user:', user);
            
            // Start polling for email verification
            const interval = setInterval(async () => {
                console.log('Checking email verification status...');
                const isVerified = await autoCRM.checkEmailVerification();
                console.log('Verification status:', isVerified);
                if (isVerified) {
                    setIsEmailVerified(true);
                    clearInterval(interval);
                    
                    // Now create the initial user record and wait for it to complete
                    await autoCRM.upsertUser({
                        id: user.id,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        role: UserRole.customer // Default role, will be updated later
                    });

                    // Small delay to ensure the database has processed the insert
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    setActiveStep(2); // Move to role selection
                }
            }, 2000);
            
            setPollingInterval(interval);
            setActiveStep(1); // Move to email confirmation step
        } catch (error: any) {
            console.error('Signup error:', error);
            if (error.message?.includes('rate limit') || error.message?.includes('throttle')) {
                setError('We are currently experiencing high traffic. Please try again in a few minutes, or contact support if this persists.');
            } else {
                setError((error as Error).message);
            }
        }
    };

    const handleCompleteSignup = async () => {
        try {
            const currentUser = await autoCRM.getCurrentUser();
            if (!currentUser) {
                throw new Error('Authentication required. Please try signing in again.');
            }

            // Update the user profile with selected role
            await autoCRM.upsertUser({
                id: currentUser.id,
                email,
                first_name: firstName,
                last_name: lastName,
                role: selectedRole!
            });

            const updatedUser = await autoCRM.getUser(currentUser.id);
            if (!updatedUser) {
                throw new Error('Failed to retrieve updated user profile');
            }

            setCurrentUser(updatedUser);
            navigate('/');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const roleCards = [
        {
            role: UserRole.customer,
            title: "I Need Support",
            description: "Report issues, request features, or get help with the system",
            icon: <SupportIcon sx={{ fontSize: 40 }} />
        },
        {
            role: UserRole.agent,
            title: "I Provide Support",
            description: "Help customers, manage tickets, and resolve issues",
            icon: <BuildIcon sx={{ fontSize: 40 }} />
        },
        {
            role: UserRole.admin,
            title: "I Manage the System",
            description: "Administer the platform, manage users, and oversee operations",
            icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />
        }
    ];

    const renderAuthForm = () => (
        <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'signup' && activeStep === 0 && (
                <>
                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleInitialSignup}
                        disabled={!email || !password || !firstName || !lastName}
                    >
                        Next
                    </Button>
                </>
            )}
            {mode === 'login' && (
                <Button variant="contained" onClick={handleLogin}>
                    Sign In
                </Button>
            )}
            <Button 
                variant="text" 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
        </Stack>
    );

    const renderEmailConfirmation = () => (
        <Stack spacing={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                Verify Your Email
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', justifyContent: 'center' }}>
                <CircularProgress size={100} />
                <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <EmailIcon sx={{ fontSize: 50, color: 'primary.main' }} />
                </Box>
            </Box>

            <Typography>
                We've sent a verification link to:
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
                {email}
            </Typography>
            <Typography color="text.secondary">
                Please check your email and click the verification link to continue.
            </Typography>
            
            <Button 
                variant="outlined"
                onClick={() => autoCRM.resendVerificationEmail(email)}
                startIcon={<RefreshIcon />}
            >
                Resend Verification Email
            </Button>
        </Stack>
    );

    const renderRoleSelection = () => (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                How will you be using AutoCRM?
            </Typography>
            <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                sx={{ mt: 4 }}
            >
                {roleCards.map((card) => (
                    <Card 
                        key={card.role}
                        sx={{ 
                            flex: 1,
                            border: selectedRole === card.role ? 2 : 0,
                            borderColor: 'primary.main'
                        }}
                    >
                        <CardActionArea 
                            onClick={() => setSelectedRole(card.role)}
                            sx={{ height: '100%', p: 2 }}
                        >
                            <CardContent>
                                <Stack 
                                    spacing={2} 
                                    alignItems="center" 
                                    sx={{ height: '100%' }}
                                >
                                    {card.icon}
                                    <Typography variant="h6" component="div">
                                        {card.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {card.description}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Stack>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                    variant="contained" 
                    onClick={handleCompleteSignup}
                    disabled={!selectedRole}
                >
                    Complete Registration
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ py: 8 }}>
            <Typography variant="h3" align="center" gutterBottom>
                Welcome to AutoCRM
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
                Your all-in-one solution for customer support and issue tracking
            </Typography>

            {mode === 'choose' ? (
                <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: 300, mx: 'auto' }}>
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => setMode('signup')}
                        fullWidth
                    >
                        Get Started
                    </Button>
                    <Button 
                        variant="outlined"
                        size="large"
                        onClick={() => setMode('login')}
                        fullWidth
                    >
                        I already have an account
                    </Button>
                </Stack>
            ) : (
                <Paper sx={{ p: 4, maxWidth: mode === 'signup' && activeStep > 0 ? 1000 : 500, mx: 'auto' }}>
                    {mode === 'signup' && (
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            <Step>
                                <StepLabel>Account Details</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Verify Email</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Choose Your Role</StepLabel>
                            </Step>
                        </Stepper>
                    )}
                    {mode === 'login' && renderAuthForm()}
                    {mode === 'signup' && (
                        <>
                            {activeStep === 0 && renderAuthForm()}
                            {activeStep === 1 && renderEmailConfirmation()}
                            {activeStep === 2 && renderRoleSelection()}
                        </>
                    )}
                </Paper>
            )}
        </Box>
    );
} 