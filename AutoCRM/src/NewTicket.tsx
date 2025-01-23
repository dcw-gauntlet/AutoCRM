import React, { useState } from 'react';
import {
  Paper,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { client } from './client';
import { TicketPriority, TicketType } from './types';

interface NewTicketProps {
  onComplete: () => void;
}

export const NewTicket: React.FC<NewTicketProps> = ({ onComplete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [type, setType] = useState<TicketType>('support');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.createTicket({
        title,
        description,
        priority,
        type,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      // You might want to add error handling UI here
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Create New Ticket</Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            fullWidth
            required
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </TextField>

          <TextField
            select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as TicketType)}
            fullWidth
            required
          >
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature</MenuItem>
            <MenuItem value="support">Support</MenuItem>
            <MenuItem value="inquiry">Inquiry</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Create Ticket
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
