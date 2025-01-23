import { 
    Avatar, 
    Typography, 
    Stack, 
    Tooltip, 
    Paper,
    Box
} from '@mui/material';
import { User, UserRole } from '../AutoCRM';

// Helper functions moved to separate utility file
export const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getRoleColor = (role: UserRole) => {
    switch (role) {
        case UserRole.admin:
            return '#ff4444';
        case UserRole.agent:
            return '#44b700';
        default:
            return '#1976d2';
    }
};

interface UserDisplayProps {
    user: User;
    size?: 'small' | 'medium' | 'large';
    showTooltip?: boolean;
}

export function UserDisplay({ user, size = 'medium', showTooltip = true }: UserDisplayProps) {
    const avatarSizes = {
        small: 24,
        medium: 32,
        large: 40
    };

    const fontSizes = {
        small: '0.75rem',
        medium: '0.875rem',
        large: '1rem'
    };

    const AvatarComponent = (
        <Avatar 
            sx={{ 
                bgcolor: getRoleColor(user.role),
                width: avatarSizes[size], 
                height: avatarSizes[size],
                fontSize: fontSizes[size]
            }}
        >
            {getInitials(user.first_name, user.last_name)}
        </Avatar>
    );

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {showTooltip ? (
                <Tooltip
                    title={
                        <Paper sx={{ p: 1 }}>
                            <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
                            <Typography variant="body2"><strong>Role:</strong> {user.role}</Typography>
                        </Paper>
                    }
                >
                    {AvatarComponent}
                </Tooltip>
            ) : AvatarComponent}
            <Typography sx={{ fontSize: fontSizes[size] }}>
                {user.first_name} {user.last_name}
            </Typography>
        </Stack>
    );
} 