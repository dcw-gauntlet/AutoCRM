import { AutoCRM, TicketPriority, TicketStatus, TicketType, User, UserRole } from './AutoCRM';
import { Button, Typography, Stack, TextField, Box, MenuItem, Paper, Chip, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Container } from '@mui/material';
import { Dashboard } from './Dashboard';
import { TicketDetails } from './TicketDetails';
import { NewTicket } from './components/NewTicket';
import TestPage from './TestPage';
import { UserDisplay } from './components/UserDisplay';
import { Profile } from './components/Profile';
import { Welcome } from './components/Welcome';
import { EmailVerificationSuccess } from './components/EmailVerificationSuccess';

// Create an AppContent component that uses hooks
function AppContent({ autoCRM, currentUser, setCurrentUser }: { 
    autoCRM: AutoCRM, 
    currentUser: User | null,
    setCurrentUser: (user: User | null) => void 
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                setIsLoading(true);
                const currentUser = await autoCRM.getCurrentUser();
                setCurrentUser(currentUser);
            } catch (error) {
                await autoCRM.signOut();
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadCurrentUser();
    }, [autoCRM, setCurrentUser]);

    const handleTicketSelect = (ticketId: number) => {
        navigate(`/ticket/${ticketId}`);
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>;
    }

    // Special case for email verification page
    if (location.pathname === '/auth/verify-email') {
        return <EmailVerificationSuccess />;
    }

    return (
        <>
            {!currentUser ? (
                <Welcome autoCRM={autoCRM} setCurrentUser={setCurrentUser} />
            ) : (
                <>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                AutoCRM
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button 
                                    color="inherit" 
                                    component={Link as any} 
                                    to="/"
                                >
                                    Dashboard
                                </Button>
                                <Button 
                                    color="inherit" 
                                    component={Link as any} 
                                    to="/new-ticket"
                                >
                                    New Ticket
                                </Button>
                                {currentUser && (
                                    <>
                                        <Button 
                                            color="inherit" 
                                            component={Link as any} 
                                            to="/profile"
                                            startIcon={
                                                <UserDisplay 
                                                    user={currentUser} 
                                                    size="small" 
                                                    showTooltip={false}
                                                />
                                            }
                                        />
                                        <Button 
                                            color="inherit"
                                            onClick={async () => {
                                                await autoCRM.signOut();
                                                setCurrentUser(null);
                                                navigate('/');
                                            }}
                                        >
                                            Logout
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        </Toolbar>
                    </AppBar>

                    <Container sx={{ mt: 4 }}>
                        <Routes>
                            <Route path="/" element={
                                <Dashboard 
                                    autoCRM={autoCRM} 
                                    onTicketSelect={handleTicketSelect} 
                                />
                            } />
                            <Route path="/auth/verify-email" element={<EmailVerificationSuccess />} />
                            <Route path="/new-ticket" element={<NewTicket autoCRM={autoCRM} />} />
                            <Route path="/ticket/:id" element={<TicketDetails autoCRM={autoCRM} />} />
                            <Route path="/test" element={<TestPage autoCRM={autoCRM} />} />
                            <Route 
                                path="/profile" 
                                element={
                                    <Profile 
                                        autoCRM={autoCRM} 
                                        currentUser={currentUser} 
                                    />
                                } 
                            />
                        </Routes>
                    </Container>
                </>
            )}
        </>
    );
}

// Main App component that provides the Router context
export default function App({ autoCRM }: { autoCRM: AutoCRM }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    return (
        <BrowserRouter>
            <AppContent 
                autoCRM={autoCRM} 
                currentUser={currentUser} 
                setCurrentUser={setCurrentUser}
            />
        </BrowserRouter>
    );
}

