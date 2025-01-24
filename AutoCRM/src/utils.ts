import { UserRole } from './AutoCRM';

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