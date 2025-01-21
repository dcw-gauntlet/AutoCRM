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
    Box, 
    Typography, 
    Popover,
    Paper,
    IconButton
} from '@mui/material';
import { useState } from 'react';
import { LocalOffer } from '@mui/icons-material';
import { Ticket } from './types';
import { statusConfig, priorityConfig, getStatusStyles, getPriorityStyles, getTypeIcon } from './utils/ticketStyles';

export const TicketRow = ({ ticket, onSelect }: { 
    ticket: Ticket;
    onSelect: (ticketId: number) => void;
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const StatusIcon = statusConfig[ticket.status].icon;
    const PriorityIcon = priorityConfig[ticket.priority].icon;
    const TypeIcon = getTypeIcon(ticket.type);

    const handleTagClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleTagClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const cellStyles = {
        whiteSpace: 'normal',
        overflow: 'hidden',
        padding: '16px'
    };

    const iconCellStyles = {
        whiteSpace: 'nowrap',
        padding: '16px'
    };

    return (
        <TableRow
            sx={{
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                cursor: 'pointer'
            }}
            onClick={() => onSelect(ticket.id)}
        >
            <TableCell sx={iconCellStyles}>
                <Box sx={getStatusStyles(ticket.status)} title={statusConfig[ticket.status].label}>
                    <StatusIcon fontSize="small" />
                </Box>
            </TableCell>
            <TableCell sx={iconCellStyles}>
                <Box sx={getPriorityStyles(ticket.priority)} title={priorityConfig[ticket.priority].label}>
                    <PriorityIcon fontSize="small" />
                </Box>
            </TableCell>
            <TableCell sx={iconCellStyles}>
                <Box sx={{ display: 'flex', alignItems: 'center' }} title={ticket.type}>
                    <TypeIcon fontSize="small" />
                </Box>
            </TableCell>
            <TableCell sx={cellStyles}>
                <Typography 
                    variant="body1" 
                    fontWeight="medium"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.2
                    }}
                >
                    {ticket.title}
                </Typography>
            </TableCell>
            <TableCell sx={cellStyles}>
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.2
                    }}
                >
                    {ticket.description}
                </Typography>
            </TableCell>
            <TableCell sx={iconCellStyles}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton 
                        size="small" 
                        onClick={handleTagClick}
                        sx={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.08)'
                            }
                        }}
                    >
                        <LocalOffer fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                        {ticket.tags.length}
                    </Typography>
                </Box>
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleTagClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <Paper sx={{ p: 1.5, maxWidth: 300 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {ticket.tags.map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={tag.tag}
                                    size="small"
                                    sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Popover>
            </TableCell>
            <TableCell sx={cellStyles}>
                {ticket.created_at.toLocaleDateString()}
            </TableCell>
            <TableCell sx={cellStyles}>
                {ticket.updated_at.toLocaleDateString()}
            </TableCell>
        </TableRow>
    )
}