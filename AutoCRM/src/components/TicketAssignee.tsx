import { useState, useEffect } from 'react';
import { 
    Autocomplete, 
    TextField, 
    Stack, 
    Typography, 
    Avatar,
    Tooltip,
    Box,
    CircularProgress,
    Paper
} from '@mui/material';
import { AutoCRM, User, UserRole } from '../AutoCRM';
import { UserDisplay } from './UserDisplay';

interface TicketAssigneeProps {
    ticketId: number;
    autoCRM: AutoCRM;
    currentAssignee: User | null;
    onAssigneeUpdate: (newAssignee: User) => void;
}

// Helper function to get initials from name
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Helper function to get role color
const getRoleColor = (role: UserRole) => {
    switch (role) {
        case UserRole.admin:
            return '#ff4444';
        case UserRole.agent:
            return '#44b700';
        default:
            return '#1976d2';
    }
};

export function TicketAssignee({ ticketId, autoCRM, currentAssignee, onAssigneeUpdate }: TicketAssigneeProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const allUsers = await autoCRM.getAllUsers();
                setUsers(allUsers);
                
                // If no assignee is set, use the default unassigned user
                if (!currentAssignee) {
                    const unassignedUser = allUsers.find(u => u.id === '00000000-0000-0000-0000-000000000000');
                    if (unassignedUser) {
                        onAssigneeUpdate(unassignedUser);
                    }
                }
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };
        loadUsers();
    }, [autoCRM, currentAssignee, onAssigneeUpdate]);

    const UserOption = ({ user, selected }: { user: User, selected?: boolean }) => (
        <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip
                title={
                    <Paper sx={{ p: 1 }}>
                        <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
                        <Typography variant="body2"><strong>Role:</strong> {user.role}</Typography>
                    </Paper>
                }
            >
                <Avatar 
                    sx={{ 
                        bgcolor: getRoleColor(user.role),
                        width: 32, 
                        height: 32,
                        fontSize: '0.875rem'
                    }}
                >
                    {getInitials(user.first_name, user.last_name)}
                </Avatar>
            </Tooltip>
            <Typography>
                {user.first_name} {user.last_name}
            </Typography>
        </Stack>
    );

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Assignee</Typography>
            
            <Autocomplete
                value={currentAssignee}
                options={users}
                loading={loading}
                getOptionLabel={(user) => `${user.first_name} ${user.last_name}`}
                renderOption={(props, user) => (
                    <li {...props}>
                        <UserDisplay user={user} />
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Assign to"
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: null,
                            endAdornment: (
                                <>
                                    {loading && <CircularProgress size={20} />}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                onChange={(_, newValue) => {
                    if (newValue) {
                        onAssigneeUpdate(newValue);
                    }
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            {currentAssignee && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Currently assigned to:
                    </Typography>
                    <UserDisplay user={currentAssignee} />
                </Box>
            )}
        </Stack>
    );
} 