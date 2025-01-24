import { AutoCRM, TicketPriority, TicketStatus, TicketType, User, UserRole } from './AutoCRM';
import { Button, Typography, Stack, Tabs, Tab, TextField, Box, MenuItem, Paper, Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Container } from '@mui/material';
import { Dashboard } from './Dashboard';
import { TicketDetails } from './TicketDetails';
import { NewTicket } from './components/NewTicket';
import TestPage from './TestPage';
import { UserDisplay } from './components/UserDisplay';
import { Profile } from './components/Profile';

// read keys from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Create an AppContent component that uses hooks
function AppContent({ autoCRM, currentUser, setCurrentUser }: { 
    autoCRM: AutoCRM, 
    currentUser: User | null,
    setCurrentUser: (user: User | null) => void 
}) {
    const navigate = useNavigate();

    useEffect(() => {
        // Load current user on mount
        const loadCurrentUser = async () => {
            try {
                const user = await autoCRM.getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error('Error loading current user:', error);
            }
        };
        loadCurrentUser();
    }, [autoCRM, setCurrentUser]);

    const handleTicketSelect = (ticketId: number) => {
        navigate(`/ticket/${ticketId}`);
    };

    return (
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
                        <Button color="inherit" component={Link as any} to="/new-ticket">
                            New Ticket
                        </Button>
                        {currentUser ? (
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
                        ) : (
                            <Button color="inherit">Login</Button>
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

function AuthenticationPanel({ autoCRM, setCurrentUser }: { autoCRM: AutoCRM, setCurrentUser: (user: User | null) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const user = await autoCRM.login(email, password);
            setCurrentUser(user);
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + (error as Error).message);
        }
    };

    return (
        <Stack spacing={2}>
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
            <Button variant="contained" onClick={handleLogin}>Login</Button>
        </Stack>
    );
}

function UsersPanel({ autoCRM, currentUser }: { autoCRM: AutoCRM, currentUser: User | null }) {
    const [userData, setUserData] = useState({
        email: currentUser?.email || '',
        first_name: currentUser?.first_name || '',
        last_name: currentUser?.last_name || '',
        role: currentUser?.role || UserRole.customer,
        id: currentUser?.id || ''
    });

    useEffect(() => {
        if (currentUser) {
            setUserData({
                email: currentUser.email,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                role: currentUser.role,
                id: currentUser.id
            });
        }
    }, [currentUser]);

    const handleUpsertUser = async () => {
        try {
            await autoCRM.upsertUser(userData);
            alert('User upserted successfully');
        } catch (error) {
            alert('Error upserting user: ' + (error as Error).message);
        }
    };

    return (
        <Stack spacing={2}>
            <TextField 
                label="Email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
            />
            <TextField 
                label="First Name"
                value={userData.first_name}
                onChange={(e) => setUserData({...userData, first_name: e.target.value})}
            />
            <TextField 
                label="Last Name"
                value={userData.last_name}
                onChange={(e) => setUserData({...userData, last_name: e.target.value})}
            />
            <TextField
                select
                label="Role"
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value as UserRole})}
            >
                {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
            </TextField>
            <TextField 
                label="ID (UUID)"
                value={userData.id}
                onChange={(e) => setUserData({...userData, id: e.target.value})}
            />
            <Button variant="contained" onClick={handleUpsertUser}>Upsert User</Button>
        </Stack>
    );
}

function TicketsPanel({ autoCRM, currentUser }: { autoCRM: AutoCRM, currentUser: User | null }) {
    const [ticketData, setTicketData] = useState({
        title: '',
        description: '',
        priority: TicketPriority.low,
        type: TicketType.bug,
        status: TicketStatus.open,
        assignee: AutoCRM.DEFAULT_USER_ID
    });

    const handleCreateTicket = async () => {
        if (!currentUser) {
            alert('Please login first');
            return;
        }

        try {
            const assigneeUser = await autoCRM.getUser(ticketData.assignee);
            if (!assigneeUser) {
                alert('Invalid assignee ID');
                return;
            }

            await autoCRM.upsertTicket({
                ...ticketData,
                creator: currentUser,
                assignee: assigneeUser
            });
            alert('Ticket created successfully');
        } catch (error) {
            alert('Error creating ticket: ' + (error as Error).message);
        }
    };

    return (
        <Stack spacing={2}>
            <TextField 
                label="Title"
                value={ticketData.title}
                onChange={(e) => setTicketData({...ticketData, title: e.target.value})}
            />
            <TextField 
                label="Description"
                multiline
                rows={4}
                value={ticketData.description}
                onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
            />
            <TextField
                select
                label="Priority"
                value={ticketData.priority}
                onChange={(e) => setTicketData({...ticketData, priority: e.target.value as TicketPriority})}
            >
                {Object.values(TicketPriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Type"
                value={ticketData.type}
                onChange={(e) => setTicketData({...ticketData, type: e.target.value as TicketType})}
            >
                {Object.values(TicketType).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Status"
                value={ticketData.status}
                onChange={(e) => setTicketData({...ticketData, status: e.target.value as TicketStatus})}
            >
                {Object.values(TicketStatus).map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
            </TextField>
            <TextField 
                label="Assignee ID"
                value={ticketData.assignee}
                onChange={(e) => setTicketData({...ticketData, assignee: e.target.value})}
            />
            <Button variant="contained" onClick={handleCreateTicket}>Create Ticket</Button>
        </Stack>
    );
}

function MessagesPanel({ autoCRM, currentUser }: { autoCRM: AutoCRM, currentUser: User | null }) {
    const [messageData, setMessageData] = useState({
        ticket_id: '',
        text: '',
        sender_id: currentUser?.id || ''
    });

    useEffect(() => {
        if (currentUser) {
            setMessageData(prev => ({
                ...prev,
                sender_id: currentUser.id
            }));
        }
    }, [currentUser]);

    const handleAddMessage = async () => {
        try {
            await autoCRM.addMessage({
                ticket_id: parseInt(messageData.ticket_id),
                text: messageData.text,
                sender_id: messageData.sender_id
            });
            alert('Message added successfully');
        } catch (error) {
            alert('Error adding message: ' + (error as Error).message);
        }
    };

    return (
        <Stack spacing={2}>
            <TextField 
                label="Ticket ID"
                type="number"
                value={messageData.ticket_id}
                onChange={(e) => setMessageData({...messageData, ticket_id: e.target.value})}
            />
            <TextField 
                label="Message"
                multiline
                rows={4}
                value={messageData.text}
                onChange={(e) => setMessageData({...messageData, text: e.target.value})}
            />
            <TextField 
                label="Sender ID"
                value={messageData.sender_id}
                onChange={(e) => setMessageData({...messageData, sender_id: e.target.value})}
            />
            <Button variant="contained" onClick={handleAddMessage}>Add Message</Button>
        </Stack>
    );
}

function TicketDetailsPanel({ autoCRM }: { autoCRM: AutoCRM }) {
    const [ticketId, setTicketId] = useState('');
    const [ticketDetails, setTicketDetails] = useState<any>(null);

    const handleGetDetails = async () => {
        try {
            const details = await autoCRM.getTicketDetails(parseInt(ticketId));
            setTicketDetails(details);
            if (!details) {
                alert('Ticket not found');
            }
        } catch (error) {
            alert('Error getting ticket details: ' + (error as Error).message);
            setTicketDetails(null);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
                <TextField 
                    label="Ticket ID"
                    type="number"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <Button variant="contained" onClick={handleGetDetails}>Get Details</Button>
            </Stack>

            {ticketDetails && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Ticket Details</Typography>
                    <Stack spacing={1}>
                        <Typography><strong>Title:</strong> {ticketDetails.title}</Typography>
                        <Typography><strong>Description:</strong> {ticketDetails.description}</Typography>
                        <Typography><strong>Status:</strong> {ticketDetails.status}</Typography>
                        <Typography><strong>Priority:</strong> {ticketDetails.priority}</Typography>
                        <Typography><strong>Type:</strong> {ticketDetails.type}</Typography>
                        <Typography><strong>Created:</strong> {new Date(ticketDetails.created_at).toLocaleString()}</Typography>
                        <Typography><strong>Updated:</strong> {new Date(ticketDetails.updated_at).toLocaleString()}</Typography>
                        <Typography><strong>Creator:</strong> {ticketDetails.creator.first_name} {ticketDetails.creator.last_name}</Typography>
                        <Typography><strong>Assignee:</strong> {ticketDetails.assignee.first_name} {ticketDetails.assignee.last_name}</Typography>
                        
                        <Typography variant="subtitle1" sx={{ mt: 2 }}><strong>Messages:</strong></Typography>
                        {ticketDetails.messages.map((msg: any) => (
                            <Paper key={msg.id} variant="outlined" sx={{ p: 1 }}>
                                <Typography><strong>{msg.sender.first_name} {msg.sender.last_name}:</strong></Typography>
                                <Typography>{msg.text}</Typography>
                                <Typography variant="caption">{new Date(msg.created_at).toLocaleString()}</Typography>
                            </Paper>
                        ))}

                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}><strong>Tags:</strong></Typography>
                        {ticketDetails.tags && ticketDetails.tags.length > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {ticketDetails.tags.map((tag: any) => (
                                    <Chip 
                                        key={tag.id} 
                                        label={tag.tag}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography color="text.secondary" variant="body2">
                                No tags added to this ticket
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}

function TagsPanel({ autoCRM }: { autoCRM: AutoCRM }) {
    const [newTag, setNewTag] = useState('');
    const [ticketId, setTicketId] = useState('');
    const [tagId, setTagId] = useState('');

    const handleCreateTag = async () => {
        try {
            const tag = await autoCRM.createTag(newTag);
            alert(`Tag created successfully with ID: ${tag.id}`);
            setNewTag('');
        } catch (error) {
            alert('Error creating tag: ' + (error as Error).message);
        }
    };

    const handleAddTagToTicket = async () => {
        try {
            await autoCRM.addTag(parseInt(ticketId), parseInt(tagId));
            alert('Tag added to ticket successfully');
            setTicketId('');
            setTagId('');
        } catch (error) {
            alert('Error adding tag to ticket: ' + (error as Error).message);
        }
    };

    return (
        <Stack spacing={3}>
            {/* Create new tag section */}
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Create New Tag</Typography>
                <Stack spacing={2}>
                    <TextField 
                        label="Tag Name"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleCreateTag}
                        disabled={!newTag.trim()}
                    >
                        Create Tag
                    </Button>
                </Stack>
            </Paper>

            {/* Add tag to ticket section */}
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Add Tag to Ticket</Typography>
                <Stack spacing={2}>
                    <TextField 
                        label="Ticket ID"
                        type="number"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                    />
                    <TextField 
                        label="Tag ID"
                        type="number"
                        value={tagId}
                        onChange={(e) => setTagId(e.target.value)}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleAddTagToTicket}
                        disabled={!ticketId || !tagId}
                    >
                        Add Tag to Ticket
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}