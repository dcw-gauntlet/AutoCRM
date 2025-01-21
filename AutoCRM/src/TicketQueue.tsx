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
} from '@mui/material';
import { useState } from 'react';
import { TicketRow } from './TicketRow';
import { Ticket, TicketStatus, TicketPriority } from './types';
import { FilterState, SortDirection, SortField, filterTickets } from './utils/ticketFilters';
import { statusConfig, priorityConfig } from './utils/ticketStyles';

interface TicketQueueProps {
    title: string;
    tickets: Ticket[];
    onTicketSelect: (ticketId: number) => void;
}

export const TicketQueue = ({ title, tickets, onTicketSelect }: TicketQueueProps) => {
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        priority: 'all',
        type: 'all',
        search: ''
    });

    const [sortField, setSortField] = useState<SortField>('created_at');
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

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <TextField
                    label="Search"
                    size="small"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {(Object.keys(statusConfig) as TicketStatus[]).map(status => (
                            <MenuItem key={status} value={status}>
                                {statusConfig[status].label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        value={filters.priority}
                        label="Priority"
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {(Object.keys(priorityConfig) as TicketPriority[]).map(priority => (
                            <MenuItem key={priority} value={priority}>
                                {priorityConfig[priority].label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={filters.type}
                        label="Type"
                        onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="bug">Bug</MenuItem>
                        <MenuItem value="feature">Feature</MenuItem>
                        <MenuItem value="support">Support</MenuItem>
                        <MenuItem value="inquiry">Inquiry</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer 
                component={Paper} 
                sx={{ 
                    height: '30vh',
                    boxShadow: 2,
                    '& .MuiTableCell-head': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold'
                    }
                }}
            >
                <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell width="40px" sx={{ p: 0.5 }}>
                                <TableSortLabel
                                    active={sortField === 'status'}
                                    direction={sortField === 'status' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('status')}
                                    title="Status"
                                />
                            </TableCell>
                            <TableCell width="40px" sx={{ p: 0.5 }}>
                                <TableSortLabel
                                    active={sortField === 'priority'}
                                    direction={sortField === 'priority' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('priority')}
                                    title="Priority"
                                />
                            </TableCell>
                            <TableCell width="40px" sx={{ p: 0.5 }}>
                                <TableSortLabel
                                    active={sortField === 'type'}
                                    direction={sortField === 'type' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('type')}
                                    title="Type"
                                />
                            </TableCell>
                            <TableCell width="200px">
                                <TableSortLabel
                                    active={sortField === 'title'}
                                    direction={sortField === 'title' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('title')}
                                >
                                    Title
                                </TableSortLabel>
                            </TableCell>
                            <TableCell width="250px">Description</TableCell>
                            <TableCell width="150px">Tags</TableCell>
                            <TableCell width="80px">Created</TableCell>
                            <TableCell width="80px">Updated</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket) => (
                                <TicketRow 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    onSelect={(id) => onTicketSelect(id)}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell 
                                    colSpan={8} 
                                    sx={{ 
                                        textAlign: 'center',
                                        color: 'text.secondary',
                                        py: 4  // Add padding to top and bottom
                                    }}
                                >
                                    <Typography variant="h6" sx={{ height: '100%' }}>
                                        No tickets found
                                    </Typography>
                                    <Typography variant="body2">
                                        Try adjusting your filters
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
