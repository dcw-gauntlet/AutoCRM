import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Stack, 
    Typography, 
    TextField, 
    MenuItem, 
    Button,
    Paper,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { green } from '@mui/material/colors';
import { AutoCRM, Ticket, TicketPriority, TicketStatus, TicketType, User } from '../AutoCRM';
import { TicketTags } from './TicketTags';
import { TicketAssignee } from './TicketAssignee';

interface NewTicketProps {
    autoCRM: AutoCRM;
}

export function NewTicket({ autoCRM }: NewTicketProps) {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [ticket, setTicket] = useState<Partial<Ticket>>({
        title: '',
        description: '',
        priority: TicketPriority.low,
        type: TicketType.bug,
        status: TicketStatus.open,
        tags: [],
        assignee: null
    });

    useEffect(() => {
        // Get current user when component mounts
        const loadCurrentUser = async () => {
            try {
                const user = await autoCRM.getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error('Error loading current user:', error);
                alert('Please log in to create tickets');
                navigate('/');
            }
        };
        loadCurrentUser();
    }, [autoCRM, navigate]);

    useEffect(() => {
        // Set default assignee to unassigned user
        const setDefaultAssignee = async () => {
            const unassignedUser = await autoCRM.getUser(autoCRM.DEFAULT_USER_ID);
            if (unassignedUser) {
                setTicket(prev => ({ ...prev, assignee: unassignedUser }));
            }
        };
        setDefaultAssignee();
    }, [autoCRM]);

    const handleSubmit = async () => {
        if (!ticket.title || !ticket.description) {
            alert('Please fill in all required fields');
            return;
        }

        if (!currentUser) {
            alert('Please log in to create tickets');
            return;
        }

        setSaving(true);
        try {
            await autoCRM.upsertTicket({
                ...ticket,
                creator: currentUser,
                assignee: ticket.assignee || currentUser
            });
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500); // Navigate after showing success for 1.5 seconds
        } catch (error) {
            console.error('Error creating ticket:', error);
            alert('Error creating ticket: ' + (error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleAssigneeUpdate = (newAssignee: User) => {
        setTicket(prev => ({
            ...prev,
            assignee: newAssignee
        }));
    };

    const handleTagsUpdate = async () => {
        // Refresh ticket data to get updated tags
        if (ticket.id) {
            const updatedTicket = await autoCRM.getTicketDetails(ticket.id);
            if (updatedTicket) {
                setTicket(prev => ({
                    ...prev,
                    tags: updatedTicket.tags
                }));
            }
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
                <Typography variant="h4">
                    Create New Ticket
                </Typography>

                <TextField
                    label="Title"
                    value={ticket.title}
                    onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
                    required
                    fullWidth
                />

                <TextField
                    label="Description"
                    value={ticket.description}
                    onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                    multiline
                    rows={4}
                    required
                    fullWidth
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        select
                        label="Priority"
                        value={ticket.priority}
                        onChange={(e) => setTicket({ ...ticket, priority: e.target.value as TicketPriority })}
                        fullWidth
                    >
                        {Object.values(TicketPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Type"
                        value={ticket.type}
                        onChange={(e) => setTicket({ ...ticket, type: e.target.value as TicketType })}
                        fullWidth
                    >
                        {Object.values(TicketType).map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Status"
                        value={ticket.status}
                        onChange={(e) => setTicket({ ...ticket, status: e.target.value as TicketStatus })}
                        fullWidth
                    >
                        {Object.values(TicketStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <TicketAssignee
                    ticketId={ticket.id || 0}
                    autoCRM={autoCRM}
                    currentAssignee={ticket.assignee}
                    onAssigneeUpdate={handleAssigneeUpdate}
                />

                {ticket.id && (
                    <TicketTags
                        ticketId={ticket.id}
                        autoCRM={autoCRM}
                        currentTags={ticket.tags || []}
                        onTagsUpdate={handleTagsUpdate}
                    />
                )}

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button 
                        onClick={() => navigate('/')}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={saving || !ticket.title || !ticket.description}
                        startIcon={saving && <CircularProgress size={20} />}
                    >
                        Create Ticket
                    </Button>
                </Stack>

                <Snackbar
                    open={showSuccess}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    sx={{ mt: 8 }}
                >
                    <Alert 
                        icon={<CheckCircle sx={{ color: green[500] }} />}
                        severity="success"
                        sx={{ 
                            alignItems: 'center',
                            '& .MuiAlert-icon': {
                                fontSize: 40
                            }
                        }}
                    >
                        Ticket Created Successfully!
                    </Alert>
                </Snackbar>
            </Stack>
        </Paper>
    );
} 