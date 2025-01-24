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
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    showTooltip?: boolean;
}

export function UserDisplay({ user, size = 'medium', showTooltip = true }: UserDisplayProps) {
    const avatarSizes = {
        small: 32,
        medium: 48,
        large: 64,
        xlarge: 96
    };

    const fontSizes = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem',
        xlarge: '1.5rem'
    };

    const AvatarComponent = (
        <Avatar 
            src={user.profile_picture_url}
            sx={{ 
                bgcolor: getRoleColor(user.role),
                width: avatarSizes[size], 
                height: avatarSizes[size],
                border: `2px solid ${getRoleColor(user.role)}`,
                '& img': {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                }
            }}
        >
            {getInitials(user.first_name, user.last_name)}
        </Avatar>
    );

    console.log('UserDisplay - profile picture URL:', user.profile_picture_url);

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