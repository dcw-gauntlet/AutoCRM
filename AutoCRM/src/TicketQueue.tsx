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
        status: 'all',
        priority: 'all',
        type: 'all',
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

    return (
        <Stack spacing={2} sx={{ 
            height: 'calc(100vh - 200px)', // Take up most of the available height
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2
        }}>
            <Typography variant="h6">{title}</Typography>
            
            {/* Filter Controls */}
            <Stack direction="row" spacing={2} sx={{ pb: 2, flexShrink: 0 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {Object.values(TicketStatus).map(status => (
                            <MenuItem key={status} value={status}>
                                {status.replace('_', ' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        value={filters.priority}
                        label="Priority"
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {Object.values(TicketPriority).map(priority => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={filters.type}
                        label="Type"
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {Object.values(TicketType).map(type => (
                            <MenuItem key={type} value={type}>
                                {type.replace('_', ' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    label="Search"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    sx={{ minWidth: 200 }}
                />
            </Stack>

            <TableContainer sx={{ flexGrow: 1 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket</TableCell>
                            <TableCell sx={{ padding: '16px' }}>Tags</TableCell>
                            <TableCell sx={{ padding: '16px' }}>Status</TableCell>
                            <TableCell sx={{ padding: '16px' }}>Priority</TableCell>
                            <TableCell sx={{ padding: '16px' }}>Type</TableCell>
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
    );
}
