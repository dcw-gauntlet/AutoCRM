import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  styled,
  ListItemButton,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Queue as QueueIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AddCircleOutline as AddTicketIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

type ActiveComponent = 'dashboard' | 'newTicket'

interface SidebarProps {
  onNavigate: (component: ActiveComponent) => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : theme => theme.spacing(7),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : theme => theme.spacing(7),
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <List>
        <ListItem>
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </ListItem>

        <ListItemButton 
          onClick={() => onNavigate('newTicket')}
          sx={{ 
            backgroundColor: theme => theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.dark,
            },
            mx: 1,
            borderRadius: 1,
            mb: 1
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <AddTicketIcon />
          </ListItemIcon>
          <ListItemText primary="New Ticket" sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />
        
        <ListItemButton onClick={() => onNavigate('dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <QueueIcon />
          </ListItemIcon>
          <ListItemText primary="Queues" sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>
      </List>
    </StyledDrawer>
  );
};
