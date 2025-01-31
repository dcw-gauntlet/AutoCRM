import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    TableSortLabel,
    Typography,
    Stack,
    Chip,
} from '@mui/material';
import { useState } from 'react';
import { TicketRow } from './TicketRow';
import { Ticket, TicketStatus, TicketPriority, TicketType } from './AutoCRM';
import { FilterState, SortDirection, SortField, filterTickets } from './utils/ticketFilters';
import { statusConfig, priorityConfig } from './utils/ticketStyles';

interface TicketQueueProps {
    title: string;
    tickets: Ticket[];
    onTicketSelect: (ticketId: number) => void;
}

export function TicketQueue({ title, tickets, onTicketSelect }: TicketQueueProps) {
    const [filters, setFilters] = useState<FilterState>({
        status: 'all' as const,
        priority: 'all' as const,
        type: 'all' as const,
        search: ''
    });

    const [sortField, setSortField] = useState<SortField>('updated_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredTickets = filterTickets(tickets, filters, sortField, sortDirection);

    const filterControlStyles = {
        '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
                bgcolor: 'action.hover',
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                }
            }
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: 'primary.main'
        }
    };

    return (
        <Paper 
            elevation={0} 
            sx={{
                height: 'calc(100vh - 200px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
                overflow: 'hidden'
            }}
        >
            <Stack spacing={2} sx={{ height: '100%', p: 3 }}>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        pb: 1
                    }}
                >
                    {title}
                </Typography>
                
                {/* Filter Controls */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack 
                        direction="row" 
                        spacing={2} 
                        sx={{ 
                            flexShrink: 0,
                            alignItems: 'center'
                        }}
                    >
                        <FormControl 
                            size="small" 
                            sx={{ 
                                minWidth: 140,
                                ...filterControlStyles
                            }}
                        >
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => setFilters({ ...filters, status: e.target.value as TicketStatus | 'all' })}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                {Object.values(TicketStatus).map(status => (
                                    <MenuItem key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl 
                            size="small" 
                            sx={{ 
                                minWidth: 140,
                                ...filterControlStyles
                            }}
                        >
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={filters.priority}
                                label="Priority"
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value as TicketPriority | 'all' })}
                            >
                                <MenuItem value="all">All Priorities</MenuItem>
                                {Object.values(TicketPriority).map(priority => (
                                    <MenuItem key={priority} value={priority}>
                                        {priority}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl 
                            size="small" 
                            sx={{ 
                                minWidth: 140,
                                ...filterControlStyles
                            }}
                        >
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.type}
                                label="Type"
                                onChange={(e) => setFilters({ ...filters, type: e.target.value as TicketType | 'all' })}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                {Object.values(TicketType).map(type => (
                                    <MenuItem key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            size="small"
                            label="Search tickets"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            sx={{ 
                                minWidth: 250,
                                ml: 'auto',
                                ...filterControlStyles
                            }}
                        />
                    </Stack>
                </Paper>

                <TableContainer 
                    sx={{ 
                        flexGrow: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'auto'
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        borderBottom: 2,
                                        borderColor: 'divider',
                                        py: 2,
                                        px: 3,
                                        fontWeight: 600
                                    }}
                                >
                                    Ticket
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        borderBottom: 2,
                                        borderColor: 'divider',
                                        py: 2,
                                        px: 3,
                                        fontWeight: 600
                                    }}
                                >
                                    Tags
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        borderBottom: 2,
                                        borderColor: 'divider',
                                        py: 2,
                                        px: 3,
                                        fontWeight: 600
                                    }}
                                >
                                    Status
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        borderBottom: 2,
                                        borderColor: 'divider',
                                        py: 2,
                                        px: 3,
                                        fontWeight: 600
                                    }}
                                >
                                    Priority
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        borderBottom: 2,
                                        borderColor: 'divider',
                                        py: 2,
                                        px: 3,
                                        fontWeight: 600
                                    }}
                                >
                                    Type
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTickets.map(ticket => (
                                <TicketRow 
                                    key={ticket.id} 
                                    ticket={ticket}
                                    onClick={() => ticket.id && onTicketSelect(ticket.id)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Paper>
    );
}
