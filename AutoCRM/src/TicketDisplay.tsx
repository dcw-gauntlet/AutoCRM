import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Stack,
  Grid,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { MessageDisplay } from './MessageDisplay';
import { Ticket, TicketMessage, UserProfile } from './types';
import styled from 'styled-components';
import { User } from './User';
import AddIcon from '@mui/icons-material/Add';
import { TicketStatus, TicketType } from './types';

const ScrollableMessages = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
`;

interface TicketDisplayProps {
  ticket: Ticket;
  messages: TicketMessage[];
  mode: 'create' | 'edit' | 'view';
  onSave?: (e: React.FormEvent) => void;
  onUpdate?: (updatedTicket: Partial<Ticket>) => void;
  availableUsers?: UserProfile[];
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  ticket,
  messages,
  mode,
  onSave,
  onUpdate,
  availableUsers,
}) => {
  const [editedTicket, setEditedTicket] = React.useState<Partial<Ticket>>({
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    status: ticket.status,
    assignee: ticket.assignee,
    tags: ticket.tags,
  });

  const handleChange = (field: keyof Ticket, value: any) => {
    setEditedTicket(prev => ({ ...prev, [field]: value }));
  };

  const isEditable = mode === 'edit';

  return (
    <Paper elevation={2}>
      {/* Status Section */}
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Assigned To
            </Typography>
            {isEditable ? (
              <Select
                fullWidth
                value={editedTicket.assignee || ''}
                onChange={(e) => handleChange('assignee', { id: e.target.value })}
                renderValue={(value) => {
                  const user = availableUsers?.find(u => u.id === value);
                  return value && user ? <User user={user} /> : 'Unassigned';
                }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {availableUsers?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <User user={user} />
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Typography>
                {ticket.assignee ? (
                  <User user={ticket.assignee as unknown as UserProfile} />
                ) : (
                  'Unassigned'
                )}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Type
            </Typography>
            {isEditable ? (
              <Select
                fullWidth
                value={editedTicket.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="feature">Feature</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="inquiry">Inquiry</MenuItem>
              </Select>
            ) : (
              <Typography sx={{ textTransform: 'capitalize' }}>
                {ticket.type.replace('_', ' ')}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
            {isEditable ? (
              <Select
                fullWidth
                value={editedTicket.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            ) : (
              <Typography sx={{ textTransform: 'capitalize' }}>
                {ticket.status.replace('_', ' ')}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* About Section */}
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        {isEditable ? (
          <TextField
            fullWidth
            value={editedTicket.title}
            onChange={(e) => handleChange('title', e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography variant="h5" gutterBottom>
            {ticket.title}
          </Typography>
        )}
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {ticket.tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.tag}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={isEditable ? () => {/* Handle tag removal */} : undefined}
            />
          ))}
          {isEditable && (
            <Chip
              icon={<AddIcon />}
              label="Add Tag"
              onClick={() => {/* Handle tag addition */}}
              size="small"
            />
          )}
        </Stack>

        {isEditable ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editedTicket.description}
            onChange={(e) => handleChange('description', e.target.value)}
            variant="outlined"
          />
        ) : (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {ticket.description}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Log Section */}
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Log
        </Typography>
        <ScrollableMessages>
          {messages.map((message) => (
            <MessageDisplay key={message.id} message={message} />
          ))}
        </ScrollableMessages>
      </Box>

      {/* Actions Section */}
      <Box p={3} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
        {mode === 'create' && (
          <Button
            variant="contained"
            color="primary"
            onClick={onSave}
            size="large"
          >
            Save Ticket
          </Button>
        )}
        {mode === 'edit' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onUpdate?.(editedTicket)}
            size="large"
          >
            Update Ticket
          </Button>
        )}
      </Box>
    </Paper>
  );
};
