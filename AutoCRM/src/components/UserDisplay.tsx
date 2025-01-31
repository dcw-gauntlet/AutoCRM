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
export const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '?';
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
    user: User | null | undefined;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    showTooltip?: boolean;
}

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

export function UserDisplay({ user, size = 'medium', showTooltip = true }: UserDisplayProps) {
    if (!user) {
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: avatarSizes[size], height: avatarSizes[size] }}>
                    ?
                </Avatar>
                <Typography sx={{ fontSize: fontSizes[size] }}>
                    Unassigned
                </Typography>
            </Stack>
        );
    }

    const displayName = user.friendly_name || `${user.first_name} ${user.last_name}`;
    const tooltipName = user.friendly_name ? `${user.first_name} ${user.last_name}` : undefined;

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

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {showTooltip ? (
                <Tooltip
                    title={
                        <Paper sx={{ p: 1 }}>
                            {tooltipName && <Typography variant="body2"><strong>Name:</strong> {tooltipName}</Typography>}
                            <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
                            <Typography variant="body2"><strong>Role:</strong> {user.role}</Typography>
                        </Paper>
                    }
                >
                    {AvatarComponent}
                </Tooltip>
            ) : AvatarComponent}
            <Typography sx={{ fontSize: fontSizes[size] }}>
                {displayName}
            </Typography>
        </Stack>
    );
} 