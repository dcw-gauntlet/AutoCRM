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
    Chip,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketType } from './types';
import { statusConfig, priorityConfig } from './utils/ticketStyles';
import { Tag } from './Tag';
import { client } from './client';
import { supabase } from './supabaseClient';
import { User } from './User';

interface TicketDetailsProps {
    ticketId: number;
    onComplete: () => void;
}

interface TagType {
    id: number;
    tag: string;
    created_at: Date;
    updated_at: Date;
}

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
}

export function TicketDetails({ ticketId, onComplete }: TicketDetailsProps) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [addedTags, setAddedTags] = useState<TagType[]>([]);
    const [removedTags, setRemovedTags] = useState<TagType[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const ticketData = await client.getTicketById(ticketId);
                setTicket(ticketData);
            } catch (error) {
                console.error('Error loading ticket:', error);
            } finally {
                setLoading(false);
            }
        };

        const loadTags = async () => {
            try {
                const { data } = await supabase
                    .from('tags')
                    .select('tag')
                    .order('tag');
                setAvailableTags(data?.map(t => t.tag) || []);
            } catch (error) {
                console.error('Error loading tags:', error);
            }
        };

        const loadUsers = async () => {
            try {
                const users = await client.getAllUsers();
                setUsers(users);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };

        loadTicket();
        loadTags();
        loadUsers();
    }, [ticketId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;

        try {
            await client.updateTicket(ticketId, {
                title: ticket.title,
                description: ticket.description,
                priority: ticket.priority,
                type: ticket.type,
                status: ticket.status,
                assignee: ticket.assignee,
                addedTags,
                removedTags
            });
            // Reset tag tracking after successful update
            setAddedTags([]);
            setRemovedTags([]);
            onComplete();  // Navigate back to dashboard
        } catch (error) {
            console.error('Error updating ticket:', error);
        }
    };

    const handleTagSelect = async (newTag: string) => {
        if (!ticket) return;
        if (!ticket.tags.some(t => t.tag === newTag)) {
            const { data: tagData } = await supabase
                .from('tags')
                .select('*')
                .eq('tag', newTag)
                .single();

            if (tagData) {
                setTicket(prev => prev ? {
                    ...prev,
                    tags: [...prev.tags, tagData]
                } : null);
                setAddedTags(prev => [...prev, tagData]);
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        if (!ticket) return;
        const tagBeingRemoved = ticket.tags.find(t => t.tag === tagToRemove);
        if (tagBeingRemoved) {
            setTicket(prev => prev ? {
                ...prev,
                tags: prev.tags.filter(t => t.tag !== tagToRemove)
            } : null);
            setRemovedTags(prev => [...prev, tagBeingRemoved]);
        }
    };

    if (loading) return <CircularProgress />;
    if (!ticket) return <Typography>Ticket not found</Typography>;

    return (
        <Paper sx={{ p: 3, width: '100%', mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Edit Ticket
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Title"
                    required
                    value={ticket.title}
                    onChange={(e) => setTicket(prev => prev ? { ...prev, title: e.target.value } : null)}
                />

                <TextField
                    label="Description"
                    required
                    multiline
                    rows={4}
                    value={ticket.description}
                    onChange={(e) => setTicket(prev => prev ? { ...prev, description: e.target.value } : null)}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {ticket.tags.map((tag) => (
                            <Chip
                                key={tag.id}
                                label={tag.tag}
                                onDelete={() => removeTag(tag.tag)}
                                variant="outlined"
                            />
                        ))}
                    </Box>
                    <Tag
                        existingTags={availableTags}
                        onTagSelect={handleTagSelect}
                    />
                </Box>

                <Autocomplete
                    value={ticket.assignee ? users.find(u => u.id === ticket.assignee) : { id: '', email: 'Unassigned' } as UserProfile}
                    onChange={(_, newValue) => 
                        setTicket(prev => prev ? { ...prev, assignee: newValue?.id || null } : null)
                    }
                    options={[{ id: '', email: 'Unassigned' } as UserProfile, ...users]}
                    getOptionLabel={(user) => user.id === '' ? 'Unassigned' : (user.full_name || user.email)}
                    renderInput={(params) => (
                        <TextField {...params} label="Assignee" />
                    )}
                    renderOption={(props, user) => (
                        <li {...props}>
                            {user.id === '' ? 'Unassigned' : <User user={user} />}
                        </li>
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    clearOnEscape
                />

                <FormControl>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={ticket.status}
                        label="Status"
                        onChange={(e) => setTicket(prev => prev ? { 
                            ...prev, 
                            status: e.target.value as TicketStatus 
                        } : null)}
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
                        onChange={(e) => setTicket(prev => prev ? { 
                            ...prev, 
                            priority: e.target.value as TicketPriority 
                        } : null)}
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
                        onChange={(e) => setTicket(prev => prev ? { 
                            ...prev, 
                            type: e.target.value as TicketType 
                        } : null)}
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
                    Save Changes
                </Button>
            </Box>
        </Paper>
    );
}
