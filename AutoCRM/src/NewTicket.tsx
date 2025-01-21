import { 
    Box, 
    TextField, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Typography, 
    Paper,
    Chip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { TicketStatus, TicketPriority, TicketType } from './types';
import { statusConfig, priorityConfig } from './utils/ticketStyles';
import { supabase } from './supabaseClient';
import { Tag } from './Tag';
import { client } from './client';  // Add this import

interface NewTicketProps {
    onComplete: () => void;
}

export const NewTicket: React.FC<NewTicketProps> = ({ onComplete }) => {
    const [ticket, setTicket] = useState({
        title: '',
        description: '',
        tags: [] as string[],
        status: 'open' as TicketStatus,
        priority: 'medium' as TicketPriority,
        type: 'support' as TicketType
    });

    const [availableTags, setAvailableTags] = useState<string[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data, error } = await supabase
                    .from('tags')
                    .select('tag')
                    .order('tag');

                if (error) throw error;
                
                setAvailableTags(data.map(t => t.tag));
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await client.createTicket({
                title: ticket.title,
                description: ticket.description,
                priority: ticket.priority,
                type: ticket.type,
                tags: ticket.tags
            });
            
            onComplete();  // Navigate back to dashboard
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    const handleTagSelect = (newTag: string) => {
        // Only add the tag if it's not already in the ticket's tags
        if (!ticket.tags.includes(newTag)) {
            setTicket(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTicket(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    return (
        <Paper sx={{ p: 3, width: '100%', mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Create New Ticket
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Title"
                    required
                    value={ticket.title}
                    onChange={(e) => setTicket(prev => ({ ...prev, title: e.target.value }))}
                />

                <TextField
                    label="Description"
                    required
                    multiline
                    rows={4}
                    value={ticket.description}
                    onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {ticket.tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={() => removeTag(tag)}
                                variant="outlined"
                            />
                        ))}
                    </Box>
                    <Tag
                        existingTags={availableTags}
                        onTagSelect={handleTagSelect}
                    />
                </Box>

                <FormControl>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={ticket.status}
                        label="Status"
                        onChange={(e) => setTicket(prev => ({ 
                            ...prev, 
                            status: e.target.value as TicketStatus 
                        }))}
                    >
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <MenuItem key={status} value={status}>
                                {config.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        value={ticket.priority}
                        label="Priority"
                        onChange={(e) => setTicket(prev => ({ 
                            ...prev, 
                            priority: e.target.value as TicketPriority 
                        }))}
                    >
                        {Object.entries(priorityConfig).map(([priority, config]) => (
                            <MenuItem key={priority} value={priority}>
                                {config.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={ticket.type}
                        label="Type"
                        onChange={(e) => setTicket(prev => ({ 
                            ...prev, 
                            type: e.target.value as TicketType 
                        }))}
                    >
                        <MenuItem value="bug">Bug</MenuItem>
                        <MenuItem value="feature">Feature</MenuItem>
                        <MenuItem value="support">Support</MenuItem>
                        <MenuItem value="inquiry">Inquiry</MenuItem>
                    </Select>
                </FormControl>

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    size="large"
                    sx={{ mt: 2 }}
                >
                    Create Ticket
                </Button>
            </Box>
        </Paper>
    );
};
