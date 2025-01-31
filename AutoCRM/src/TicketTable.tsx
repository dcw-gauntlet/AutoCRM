import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    Typography,
    Stack,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    InputAdornment,
    Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import { AutoCRM, Ticket, TicketStatus, TicketPriority, TicketType, User } from './AutoCRM';
import { UserDisplay } from './components/UserDisplay';


interface TicketTableProps {
    title: string;
    tickets: Ticket[];
    autoCRM: AutoCRM;
}

const formatUserName = (user: User | null | undefined) => {
    if (!user) return 'Unassigned';
    return user.friendly_name || `${user.first_name} ${user.last_name}`.trim() || user.email || 'Unknown';
};

export function TicketTable({ title, tickets, autoCRM }: TicketTableProps) {
    const navigate = useNavigate();
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>(tickets);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        priority: 'all',
        type: 'all'
    });

    useEffect(() => {
        const loadUsers = async () => {
            const ticketsWithUsers = await Promise.all(tickets.map(async (ticket) => {
                if (typeof ticket.assignee === 'string') {
                    const user = await autoCRM.getUser(ticket.assignee);
                    return { ...ticket, assignee: user };
                }
                return ticket;
            }));
            setFilteredTickets(ticketsWithUsers);
        };

        loadUsers();
    }, [tickets, autoCRM]);

    useEffect(() => {
        const filtered = tickets.filter(ticket => {
            const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                                ticket.description.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
            const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
            const matchesType = filters.type === 'all' || ticket.type === filters.type;

            return matchesSearch && matchesStatus && matchesPriority && matchesType;
        });

        setFilteredTickets(filtered);
    }, [tickets, filters]);

    const getPriorityColor = (priority: TicketPriority) => {
        switch (priority) {
            case TicketPriority.urgent: return 'error';
            case TicketPriority.high: return 'warning';
            case TicketPriority.medium: return 'info';
            case TicketPriority.low: return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.open: return 'info';
            case TicketStatus.in_progress: return 'warning';
            case TicketStatus.closed: return 'success';
            case TicketStatus.on_hold: return 'error';
            default: return 'default';
        }
    };

    return (
        <Stack spacing={3} sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pb: 2
        }}>
            {/* Title with Paper background for better visual hierarchy */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 0, 
                    flexShrink: 0,
                    bgcolor: 'background.default'
                }}
            >
                <Typography variant="h5" component="h2">
                    {title}
                </Typography>
            </Paper>

            {/* Filters in a single row */}
            <Paper 
                elevation={1} 
                sx={{ 
                    pb: 2,
                    flexShrink: 0,
                    borderRadius: 1
                }}
            >
                <Stack 
                    direction="row" 
                    spacing={2}
                    sx={{ 
                        overflowX: 'auto',
                        pt: 2  
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search tickets..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}  // Give search field more space
                    />
                    
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        {Object.values(TicketStatus).map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Priority"
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="all">All Priorities</MenuItem>
                        {Object.values(TicketPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Type"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        {Object.values(TicketType).map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </Paper>

            {/* Updated Table Container styling */}
            <TableContainer 
                component={Paper} 
                elevation={1}
                sx={{ 
                    flexGrow: 1,
                    overflow: 'auto',
                    borderRadius: 1,
                    maxHeight: 'calc(100vh - 250px)'
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell width={100}>Status</TableCell>
                            <TableCell width={100}>Priority</TableCell>
                            <TableCell width={100}>Type</TableCell>
                            <TableCell width={150}>Assignee</TableCell>
                            <TableCell width={150}>Queue</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTickets.map((ticket) => (
                            <TableRow 
                                key={ticket.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/ticket/${ticket.id}`)}
                            >
                                <TableCell>{ticket.title}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={ticket.status} 
                                        size="small"
                                        color={getStatusColor(ticket.status)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={ticket.priority} 
                                        size="small"
                                        color={getPriorityColor(ticket.priority)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={ticket.type} 
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <UserDisplay user={ticket.assignee} />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={ticket.queue?.name || 'No Queue'}
                                        size="small"
                                        sx={{ width: '100%' }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
}
