import { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Alert 
} from '@mui/material';
import { AutoCRM } from '../AutoCRM';

interface QueueCreationProps {
    autoCRM: AutoCRM;
}

export function QueueCreation({ autoCRM }: QueueCreationProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Queue name is required');
            return;
        }

        try {
            await autoCRM.createQueue({
                name: name.trim(),
                description: description.trim()
            });
            setSuccess('Queue created successfully');
            // Clear form
            setName('');
            setDescription('');
        } catch (error) {
            setError('Failed to create queue');
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Create Queue
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                    label="Queue Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                
                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                />

                <Button 
                    variant="contained" 
                    onClick={handleCreate}
                    disabled={!name.trim()}
                >
                    Create Queue
                </Button>
            </Box>
        </Box>
    );
} 