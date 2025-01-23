import { useState, useRef, useEffect } from 'react';
import { 
    Paper, 
    Stack, 
    Typography, 
    TextField, 
    Button, 
    Box,
    CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { AutoCRM, Message, User } from '../AutoCRM';
import { UserDisplay } from './UserDisplay';

interface MessagesProps {
    ticketId: number;
    autoCRM: AutoCRM;
    messages: Message[];
    onMessagesUpdate: () => void;
}

export function Messages({ ticketId, autoCRM, messages, onMessagesUpdate }: MessagesProps) {
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // Get current user
        autoCRM.getCurrentUser().then(setCurrentUser);
    }, [autoCRM]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;

        setSending(true);
        try {
            await autoCRM.addMessage({
                ticket_id: ticketId,
                text: newMessage,
                sender_id: currentUser.id
            });
            setNewMessage('');
            onMessagesUpdate();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Messages</Typography>
            
            {/* Messages Container */}
            <Paper 
                variant="outlined" 
                sx={{ 
                    height: '400px',
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}
            >
                {messages.map((message) => (
                    <Paper 
                        key={message.id} 
                        elevation={2}
                        sx={{ 
                            p: 2,
                            width: '95%',
                            alignSelf: message.sender.id === currentUser?.id ? 'flex-end' : 'flex-start',
                            backgroundColor: message.sender.id === currentUser?.id ? 'primary.light' : 'background.paper',
                            borderRadius: 2,
                            '& > *': {
                                mb: 0.5
                            }
                        }}
                    >
                        <UserDisplay 
                            user={message.sender} 
                            size="small"
                            showTooltip={true}
                        />
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(message.created_at).toLocaleString()}
                        </Typography>
                    </Paper>
                ))}
                <div ref={messagesEndRef} />
            </Paper>

            {/* Message Input */}
            <Stack direction="row" spacing={2}>
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    multiline
                    maxRows={4}
                    disabled={sending}
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    sx={{ minWidth: '100px' }}
                >
                    {sending ? <CircularProgress size={24} /> : <SendIcon />}
                </Button>
            </Stack>
        </Stack>
    );
} 