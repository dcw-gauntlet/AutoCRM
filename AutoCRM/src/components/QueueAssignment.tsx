import { useState, useEffect } from 'react';
import { 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Button, 
    Typography,
    Paper,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Collapse
} from '@mui/material';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import { AutoCRM, User, Queue, UserRole } from '../AutoCRM';
import { UserDisplay } from './UserDisplay';

interface QueueAssignmentProps {
    autoCRM: AutoCRM;
}

export function QueueAssignment({ autoCRM }: QueueAssignmentProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedQueue, setSelectedQueue] = useState<number>(0);
    const [userQueues, setUserQueues] = useState<Queue[]>([]);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Load users and queues on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [allUsers, allQueues] = await Promise.all([
                    autoCRM.getAllUsers(),
                    autoCRM.getAllQueues()
                ]);
                // Filter out customer users and the default user
                const staffUsers = allUsers.filter(user => 
                    user.role !== UserRole.customer && 
                    user.id !== AutoCRM.DEFAULT_USER_ID
                );
                setUsers(staffUsers);
                setQueues(allQueues);
            } catch (error) {
                setMessage({ text: 'Failed to load data', type: 'error' });
            }
        };
        loadData();
    }, [autoCRM]);

    // Load user's queues when a user is selected
    useEffect(() => {
        const loadUserQueues = async () => {
            if (!selectedUser) {
                setUserQueues([]);
                return;
            }
            try {
                const queues = await autoCRM.getUserQueues(selectedUser);
                setUserQueues(queues);
            } catch (error) {
                setMessage({ text: 'Failed to load user queues', type: 'error' });
            }
        };
        loadUserQueues();
    }, [selectedUser, autoCRM]);

    const handleAssignment = async () => {
        if (!selectedUser || !selectedQueue) {
            setMessage({ text: 'Please select both a user and a queue', type: 'error' });
            return;
        }

        try {
            await autoCRM.assignUserToQueue(selectedUser, selectedQueue);
            setMessage({ text: 'User successfully assigned to queue', type: 'success' });
            // Refresh user queues
            const updatedQueues = await autoCRM.getUserQueues(selectedUser);
            setUserQueues(updatedQueues);
            // Reset queue selection
            setSelectedQueue(0);
        } catch (error) {
            setMessage({ text: 'Failed to assign user to queue', type: 'error' });
        }
    };

    const handleUnassignment = async (queueId: number) => {
        if (!selectedUser) return;

        try {
            await autoCRM.unassignUserFromQueue(selectedUser, queueId);
            setMessage({ text: 'User successfully unassigned from queue', type: 'success' });
            // Refresh user queues
            const updatedQueues = await autoCRM.getUserQueues(selectedUser);
            setUserQueues(updatedQueues);
        } catch (error) {
            setMessage({ text: 'Failed to unassign user from queue', type: 'error' });
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Queue Assignment
            </Typography>

            {message && (
                <Alert 
                    severity={message.type} 
                    sx={{ mb: 2 }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Select User</InputLabel>
                        <Select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value as string)}
                            label="Select User"
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    <UserDisplay user={user} size="small" showTooltip={false} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {selectedUser && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Current Queue Assignments
                            </Typography>
                            {userQueues.length > 0 ? (
                                <List>
                                    <TransitionGroup>
                                        {userQueues.map((queue) => (
                                            <Collapse key={queue.id}>
                                                <ListItem
                                                    secondaryAction={
                                                        <IconButton 
                                                            edge="end" 
                                                            aria-label="delete"
                                                            onClick={() => handleUnassignment(queue.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    }
                                                >
                                                    <ListItemText 
                                                        primary={queue.name}
                                                        secondary={queue.description}
                                                    />
                                                </ListItem>
                                            </Collapse>
                                        ))}
                                    </TransitionGroup>
                                </List>
                            ) : (
                                <Typography color="text.secondary">
                                    No queue assignments
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" gutterBottom>
                                Add New Assignment
                            </Typography>
                        </Grid>
                    </>
                )}

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Select Queue</InputLabel>
                        <Select
                            value={selectedQueue}
                            onChange={(e) => setSelectedQueue(e.target.value as number)}
                            label="Select Queue"
                        >
                            <MenuItem value={0}>Select a queue</MenuItem>
                            {queues
                                .filter(queue => !userQueues.some(uq => uq.id === queue.id))
                                .map((queue) => (
                                    <MenuItem key={queue.id} value={queue.id}>
                                        {queue.name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Button 
                        variant="contained" 
                        onClick={handleAssignment}
                        disabled={!selectedUser || !selectedQueue}
                        fullWidth
                    >
                        Assign User to Queue
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
