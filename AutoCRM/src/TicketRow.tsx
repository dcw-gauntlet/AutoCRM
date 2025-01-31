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
        padding: '12px 16px',
        height: '80px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        '&:first-of-type': {
            paddingLeft: '24px',
        },
        '&:last-child': {
            paddingRight: '24px',
        }
    };

    const chipBaseStyles = {
        width: '100%',
        height: '32px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        '& .MuiChip-label': {
            fontSize: '0.875rem',
            fontWeight: 500,
            px: 2,
            width: '100%',
            textAlign: 'center'
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return { 
                bgcolor: 'error.main',
                color: 'error.contrastText'
            };
            case 'in_progress': return { 
                bgcolor: 'success.main',
                color: 'success.contrastText'
            };
            case 'on_hold': return { 
                bgcolor: 'warning.main',
                color: 'warning.contrastText'
            };
            case 'closed': return { 
                bgcolor: 'info.main',
                color: 'info.contrastText'
            };
            default: return { 
                bgcolor: 'grey.200',
                color: 'text.primary'
            };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return { 
                bgcolor: 'error.main',
                color: 'error.contrastText'
            };
            case 'high': return { 
                bgcolor: 'warning.main',
                color: 'warning.contrastText'
            };
            case 'medium': return { 
                bgcolor: 'success.main',
                color: 'success.contrastText'
            };
            case 'low': return { 
                bgcolor: 'grey.200',
                color: 'text.primary'
            };
            default: return { 
                bgcolor: 'grey.200',
                color: 'text.primary'
            };
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bug': return { 
                bgcolor: 'error.light',
                color: 'error.contrastText'
            };
            case 'feature': return { 
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText'
            };
            case 'support': return { 
                bgcolor: 'warning.light',
                color: 'warning.contrastText'
            };
            case 'inquiry': return { 
                bgcolor: 'info.light',
                color: 'info.contrastText'
            };
            default: return { 
                bgcolor: 'grey.200',
                color: 'text.primary'
            };
        }
    };

    return (
        <TableRow 
            hover 
            onClick={onClick}
            sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: 'background.paper',
                '&:hover': {
                    bgcolor: 'action.hover',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }
            }}
        >
            <TableCell sx={cellStyles}>
                <Stack spacing={1}>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        {ticket.title}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{
                            color: 'text.secondary',
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
                <Stack spacing={0.75} sx={{ minHeight: 32, justifyContent: 'center' }}>
                    {tags.map((tag) => (
                        <Chip
                            key={tag.id}
                            label={tag.tag}
                            size="small"
                            sx={{
                                ...chipBaseStyles,
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: '16px',
                            }}
                        />
                    ))}
                    {tags.length === 0 && (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                lineHeight: '32px'
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
                        ...getStatusColor(ticket.status),
                        textTransform: 'capitalize'
                    }}
                />
            </TableCell>

            <TableCell sx={cellStyles}>
                <Chip
                    label={ticket.priority}
                    size="small"
                    sx={{
                        ...chipBaseStyles,
                        ...getPriorityColor(ticket.priority),
                        textTransform: 'capitalize'
                    }}
                />
            </TableCell>

            <TableCell sx={cellStyles}>
                <Chip
                    label={ticket.type.replace('_', ' ')}
                    size="small"
                    sx={{
                        ...chipBaseStyles,
                        ...getTypeColor(ticket.type),
                        textTransform: 'capitalize'
                    }}
                />
            </TableCell>

            <TableCell sx={cellStyles}>
                <Chip
                    label={ticket.assignee ? 
                        `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 
                        'Unassigned'}
                    size="small"
                    sx={{
                        ...chipBaseStyles,
                        bgcolor: 'background.default',
                        color: 'text.primary',
                    }}
                />
            </TableCell>
        </TableRow>
    );
}