import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CircularProgress, 
    Stack, 
    Typography, 
    TextField, 
    MenuItem, 
    Button,
    Paper,
    Box,
    Chip
} from '@mui/material';
import { AutoCRM, Ticket, TicketPriority, TicketStatus, TicketType, User } from './AutoCRM';
import { Messages } from './components/Messages';
import { TicketTags } from './components/TicketTags';
import { TicketAssignee } from './components/TicketAssignee';

interface TicketDetailsProps {
    autoCRM: AutoCRM;
}

export function TicketDetails({ autoCRM }: TicketDetailsProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNewTicket = !id;

    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<Partial<Ticket>>({
        title: '',
        description: '',
        priority: TicketPriority.low,
        type: TicketType.bug,
        status: TicketStatus.open,
        messages: [],
        tags: [],
        assignee: null
    });

    useEffect(() => {
        const loadTicket = async () => {
            if (!isNewTicket && id) {
                try {
                    const ticketData = await autoCRM.getTicketDetails(parseInt(id));
                    if (ticketData) {
                        setTicket(ticketData);
                    }
                } catch (error) {
                    console.error('Error loading ticket:', error);
                }
            }
            setLoading(false);
        };

        loadTicket();
    }, [id, autoCRM, isNewTicket]);

    const handleSubmit = async () => {
        try {
            if (isNewTicket) {
                await autoCRM.upsertTicket(ticket);
                navigate('/');
            } else if (id) {
                await autoCRM.upsertTicket({ ...ticket, id: parseInt(id) });
                navigate('/');
            }
        } catch (error) {
            console.error('Error saving ticket:', error);
            alert('Error saving ticket: ' + (error as Error).message);
        }
    };

    const handleMessagesUpdate = async () => {
        if (id) {
            const updatedTicket = await autoCRM.getTicketDetails(parseInt(id));
            if (updatedTicket) {
                setTicket(updatedTicket);
            }
        }
    };

    const handleTagsUpdate = async () => {
        if (id) {
            const updatedTicket = await autoCRM.getTicketDetails(parseInt(id));
            if (updatedTicket) {
                setTicket(updatedTicket);
            }
        }
    };

    const handleAssigneeUpdate = async (newAssignee: User) => {
        try {
            await autoCRM.upsertTicket({
                ...ticket,
                assignee: newAssignee
            });
            const updatedTicket = await autoCRM.getTicketDetails(parseInt(id!));
            if (updatedTicket) {
                setTicket(updatedTicket);
            }
        } catch (error) {
            console.error('Error updating assignee:', error);
            alert('Failed to update assignee');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Paper sx={{ p: 2, maxWidth: '100%', overflow: 'auto' }}>
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        label="Title"
                        value={ticket.title}
                        onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
                        required
                        sx={{ flex: 2 }}
                    />
                    <TextField
                        label="Description"
                        value={ticket.description}
                        onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                        multiline
                        rows={3}
                        required
                        sx={{ flex: 3 }}
                    />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        select
                        label="Priority"
                        value={ticket.priority}
                        onChange={(e) => setTicket({ ...ticket, priority: e.target.value as TicketPriority })}
                        sx={{ flex: 1 }}
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
                        sx={{ flex: 1 }}
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
                        sx={{ flex: 1 }}
                    >
                        {Object.values(TicketStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <Stack spacing={2}>
                    <TicketAssignee
                        ticketId={parseInt(id!)}
                        autoCRM={autoCRM}
                        currentAssignee={ticket.assignee}
                        onAssigneeUpdate={handleAssigneeUpdate}
                    />
                    <Messages
                        ticketId={parseInt(id!)}
                        autoCRM={autoCRM}
                        messages={ticket.messages || []}
                        onMessagesUpdate={handleMessagesUpdate}
                    />
                    <TicketTags
                        ticketId={parseInt(id!)}
                        autoCRM={autoCRM}
                        currentTags={ticket.tags || []}
                        onTagsUpdate={handleTagsUpdate}
                    />
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!ticket.title || !ticket.description}
                    >
                        {isNewTicket ? 'Create Ticket' : 'Save Changes'}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
