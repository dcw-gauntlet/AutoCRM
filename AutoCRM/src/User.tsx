import { Box } from '@mui/material';
import { UserProfile } from './types';


interface UserProps {
  user: UserProfile;
}

export const User: React.FC<UserProps> = ({ user }) => {
  const displayName = user.friendly_name || `${user.first_name} ${user.last_name}` || user.email || 'Unknown User';
  
  return (
    <Box
      component="span"
      sx={{
        bgcolor: '#e6f3ff',
        padding: '2px 6px',
        borderRadius: '4px',
        cursor: 'help'
      }}
      title={user.email}
    >
      {displayName}
    </Box>
  );
};
