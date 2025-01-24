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
import { Ticket, TicketStatus, TicketPriority } from './AutoCRM';
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
        <Stack spacing={2}>
            <Typography variant="h6">{title}</Typography>
            <Box sx={{ 
                maxHeight: '40vh',
                overflowY: 'auto',
                // Add subtle scrollbar styling
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                    '&:hover': {
                        background: '#555',
                    },
                },
            }}>
                <Stack spacing={2} sx={{ p: 1 }}>
                    {filteredTickets.map(ticket => (
                        <Paper 
                            key={ticket.id} 
                            sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                            onClick={() => onTicketSelect(ticket.id)}
                        >
                            <Stack spacing={1}>
                                <Typography variant="subtitle1">
                                    {ticket.title}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {ticket.description}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Chip 
                                        label={ticket.status} 
                                        size="small"
                                        color={ticket.status === TicketStatus.closed ? 'default' :
                                               ticket.status === TicketStatus.in_progress ? 'primary' : 'warning'}
                                    />
                                    <Chip 
                                        label={ticket.priority}
                                        size="small"
                                        color={ticket.priority === TicketPriority.high ? 'error' : 
                                               ticket.priority === TicketPriority.medium ? 'warning' : 'default'}
                                    />
                                    {ticket.tags && ticket.tags.map((tag: any) => (
                                        <Chip
                                            key={tag.id}
                                            label={tag.tag}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                    {filteredTickets.length === 0 && (
                        <Typography color="text.secondary" sx={{ p: 2 }}>
                            No tickets found
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Stack>
    );
}
