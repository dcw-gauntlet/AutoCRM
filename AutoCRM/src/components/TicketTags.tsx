import { useState, useEffect } from 'react';
import { 
    Autocomplete, 
    TextField, 
    Chip, 
    Stack, 
    Typography, 
    Box,
    CircularProgress,
    Collapse
} from '@mui/material';
import { AutoCRM, Tag } from '../AutoCRM';

interface TicketTagsProps {
    ticketId: number;
    autoCRM: AutoCRM;
    currentTags: Tag[];
    onTagsUpdate: () => void;
}

export function TicketTags({ ticketId, autoCRM, currentTags, onTagsUpdate }: TicketTagsProps) {
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [removingTags, setRemovingTags] = useState<number[]>([]);

    useEffect(() => {
        // Load all existing tags
        const loadTags = async () => {
            try {
                // TODO: Add getAllTags method to AutoCRM
                const tags = await autoCRM.getAllTags();
                setAllTags(tags);
            } catch (error) {
                console.error('Error loading tags:', error);
            }
        };
        loadTags();
    }, [autoCRM]);

    const handleAddTag = async (tagName: string) => {
        setLoading(true);
        try {
            // Check if tag already exists
            let tag = allTags.find(t => t.tag.toLowerCase() === tagName.toLowerCase());
            
            // If not, create it
            if (!tag) {
                tag = await autoCRM.createTag(tagName);
                setAllTags([...allTags, tag]);
            }

            // Add tag to ticket
            await autoCRM.addTag(ticketId, tag.id);
            onTagsUpdate();
            setInputValue('');
        } catch (error) {
            console.error('Error adding tag:', error);
            alert('Failed to add tag');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        setRemovingTags(prev => [...prev, tagId]);
        try {
            await autoCRM.removeTag(ticketId, tagId);
            await onTagsUpdate();
        } catch (error) {
            console.error('Error removing tag:', error);
            alert('Failed to remove tag');
            setRemovingTags(prev => prev.filter(id => id !== tagId));
        }
    };

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Tags</Typography>
            
            <Autocomplete
                freeSolo
                options={allTags.map(tag => tag.tag)}
                inputValue={inputValue}
                onInputChange={(_, newValue) => setInputValue(newValue)}
                onChange={(_, newValue) => {
                    if (newValue) {
                        handleAddTag(newValue);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Add tag"
                        disabled={loading}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading && <CircularProgress size={20} />}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentTags.map((tag) => (
                    <Collapse 
                        key={tag.id} 
                        in={!removingTags.includes(tag.id)}
                        timeout={300}
                    >
                        <Chip
                            label={tag.tag}
                            onDelete={() => handleRemoveTag(tag.id)}
                            sx={{
                                transition: 'all 0.3s ease-out',
                                opacity: removingTags.includes(tag.id) ? 0.5 : 1,
                            }}
                        />
                    </Collapse>
                ))}
            </Box>
        </Stack>
    );
} 