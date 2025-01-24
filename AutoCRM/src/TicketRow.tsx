/*
* title
* description
* list of tags
* status
* priority
* type
* created at
* updated at
* Display the important information in a row in a table
*/

import { 
    TableRow, 
    TableCell, 
    Chip, 
    Typography, 
    Stack
} from '@mui/material';
import { Ticket } from './AutoCRM';

interface TicketRowProps {
    ticket: Ticket;
    onClick: () => void;
}

export function TicketRow({ ticket, onClick }: TicketRowProps) {
    const tags = ticket.tags || [];

    const cellStyles = {
        whiteSpace: 'normal',
        overflow: 'hidden',
        padding: '8px 16px',
        height: '72px',
        bgcolor: '#f5f5f5'  // Light gray background for all cells
    };

    const chipBaseStyles = {
        width: '100%',
        height: '28px',  // Slightly taller
        borderRadius: '4px',
        '& .MuiChip-label': {
            fontSize: '0.875rem',  // Bigger text
            fontWeight: 600,       // Bolder text
            px: 1,
            width: '100%',
            textAlign: 'center'
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return { 
                bgcolor: '#ff4444',
                color: '#fff'
            };
            case 'in_progress': return { 
                bgcolor: '#00C851',
                color: '#fff'
            };
            case 'on_hold': return { 
                bgcolor: '#ffbb33',
                color: '#000'
            };
            case 'closed': return { 
                bgcolor: '#2196f3',
                color: '#fff'
            };
            default: return { 
                bgcolor: '#e0e0e0',
                color: '#000'
            };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return { 
                bgcolor: '#ff4444',
                color: '#fff'
            };
            case 'high': return { 
                bgcolor: '#ffbb33',
                color: '#000'
            };
            case 'medium': return { 
                bgcolor: '#00C851',
                color: '#fff'
            };
            case 'low': return { 
                bgcolor: '#e0e0e0',
                color: '#000'
            };
            default: return { 
                bgcolor: '#e0e0e0',
                color: '#000'
            };
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bug': return { 
                bgcolor: '#ff4444',
                color: '#fff'
            };
            case 'feature': return { 
                bgcolor: '#ff80ab',
                color: '#000'
            };
            case 'support': return { 
                bgcolor: '#ffbb33',
                color: '#000'
            };
            case 'inquiry': return { 
                bgcolor: '#2196f3',
                color: '#fff'
            };
            default: return { 
                bgcolor: '#e0e0e0',
                color: '#000'
            };
        }
    };

    return (
        <TableRow 
            hover 
            onClick={onClick}
            sx={{ 
                cursor: 'pointer',
                '&:hover': {
                    bgcolor: '#eeeeee !important'  // Slightly darker on hover
                }
            }}
        >
            <TableCell sx={cellStyles}>
                <Stack spacing={0.5}>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontWeight: 500,
                            color: '#000'  // Darker text
                        }}
                    >
                        {ticket.title}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{
                            color: '#424242',  // Darker secondary text
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {ticket.description}
                    </Typography>
                </Stack>
            </TableCell>

            <TableCell sx={cellStyles}>
                <Stack spacing={0.5}>
                    {tags.map((tag) => (
                        <Chip
                            key={tag.id}
                            label={tag.tag}
                            size="small"
                            sx={{
                                ...chipBaseStyles,
                                bgcolor: 'rgba(0, 0, 0, 0.08)',
                                color: '#000'
                            }}
                        />
                    ))}
                    {tags.length === 0 && (
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                fontStyle: 'italic',
                                color: '#616161'
                            }}
                        >
                            No tags
                        </Typography>
                    )}
                </Stack>
            </TableCell>

            <TableCell sx={cellStyles}>
                <Chip
                    label={ticket.status.replace('_', ' ')}
                    size="small"
                    sx={{
                        ...chipBaseStyles,
                        ...getStatusColor(ticket.status)
                    }}
                />
            </TableCell>

            <TableCell sx={cellStyles}>
                <Chip
                    label={ticket.priority}
                    size="small"
                    sx={{
                        ...chipBaseStyles,
                        ...getPriorityColor(ticket.priority)
                    }}
                />
            </TableCell>

            <TableCell sx={cellStyles}>
                <Chip
                    label={ticket.type.replace('_', ' ')}
                    size="small"
                    sx={{
                        ...chipBaseStyles,
                        ...getTypeColor(ticket.type)
                    }}
                />
            </TableCell>
        </TableRow>
    );
}