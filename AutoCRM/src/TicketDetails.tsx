import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CircularProgress, 
    Stack, 
    Typography, 
    TextField, 
    MenuItem, 
    Button,
    Paper,
    Box,
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import { AutoCRM, Ticket, TicketPriority, TicketStatus, TicketType, User, MessageType, UserRole } from './AutoCRM';
import { Messages } from './components/Messages';
import { TicketTags } from './components/TicketTags';
import { TicketAssignee } from './components/TicketAssignee';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TagIcon from '@mui/icons-material/Tag';
import MessageIcon from '@mui/icons-material/Message';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PersonIcon from '@mui/icons-material/Person';
import { FileDisplay } from './components/FileDisplay';

interface TicketDetailsProps {
    autoCRM: AutoCRM;
}

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <Box hidden={value !== index} sx={{ pt: 2 }}>
            {value === index && children}
        </Box>
    );
}

export function TicketDetails({ autoCRM }: TicketDetailsProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNewTicket = !id;
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<Partial<Ticket>>({
        title: '',
        description: '',
        priority: TicketPriority.low,
        type: TicketType.bug,
        status: TicketStatus.open,
        messages: [],
        tags: [],
        assignee: undefined
    });
    const [activeTab, setActiveTab] = useState(0);
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Load current user
                const user = await autoCRM.getCurrentUser();
                setCurrentUser(user);

                // Load ticket if editing
                if (!isNewTicket && id) {
                    const ticketData = await autoCRM.getTicketDetails(parseInt(id));
                    if (ticketData) {
                        setTicket(ticketData);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, autoCRM, isNewTicket]);

    useEffect(() => {
        const loadFiles = async () => {
            if (id) {
                try {
                    const files = await autoCRM.getTicketFiles(parseInt(id));
                    setFiles(files);
                } catch (error) {
                    console.error('Error loading files:', error);
                }
            }
        };
        loadFiles();
    }, [id, autoCRM]);

    const handleSubmit = async () => {
        try {
            if (isNewTicket) {
                await autoCRM.upsertTicket(ticket);
                navigate('/');
            } else if (id) {
                await autoCRM.upsertTicket({ ...ticket, id: parseInt(id) });
                navigate('/');
            }
        } catch (error) {
            console.error('Error saving ticket:', error);
            alert('Error saving ticket: ' + (error as Error).message);
        }
    };

    const handleMessagesUpdate = async (messageType: MessageType = MessageType.public) => {
        if (id) {
            const updatedTicket = await autoCRM.getTicketDetails(parseInt(id));
            if (updatedTicket) {
                setTicket(updatedTicket);
            }
        }
    };

    const handleTagsUpdate = async () => {
        if (id) {
            const updatedTicket = await autoCRM.getTicketDetails(parseInt(id));
            if (updatedTicket) {
                setTicket(updatedTicket);
            }
        }
    };

    const handleAssigneeUpdate = async (newAssignee: User) => {
        try {
            await autoCRM.upsertTicket({
                ...ticket,
                assignee: newAssignee
            });
            const updatedTicket = await autoCRM.getTicketDetails(parseInt(id!));
            if (updatedTicket) {
                setTicket(updatedTicket);
            }
        } catch (error) {
            console.error('Error updating assignee:', error);
            alert('Failed to update assignee');
        }
    };

    console.log("All messages:", ticket.messages);
    console.log("Agent messages:", ticket.messages?.filter(m => m.message_type === MessageType.agent_only));
    console.log("Public messages:", ticket.messages?.filter(m => m.message_type === MessageType.public));

    const isStaff = currentUser?.role === UserRole.agent || currentUser?.role === UserRole.admin;

    if (loading) return <CircularProgress />;

    return (
        <Paper sx={{ 
            p: 2, 
            maxWidth: '100%',
            height: 'calc(100vh - 128px)', // 64px AppBar + 24px margin top + 40px bottom margin
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            mt: 3 // Add explicit top margin
        }}>
            <Stack spacing={2} sx={{ height: '100%', overflow: 'hidden' }}>
                {/* Title and Description section */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flexShrink: 0 }}>
                    <TextField
                        label="Title"
                        value={ticket.title}
                        onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
                        required
                        sx={{ flex: 2 }}
                    />
                    <TextField
                        label="Description"
                        value={ticket.description}
                        onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                        multiline
                        rows={3}
                        required
                        sx={{ flex: 3 }}
                    />
                </Stack>

                {/* Status fields section */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexShrink: 0 }}>
                    {isStaff ? (
                        <TextField
                            select
                            label="Priority"
                            value={ticket.priority}
                            onChange={(e) => setTicket({ ...ticket, priority: e.target.value as TicketPriority })}
                            sx={{ flex: 1 }}
                        >
                            {Object.values(TicketPriority).map((priority) => (
                                <MenuItem key={priority} value={priority}>
                                    {priority}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PriorityHighIcon color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    Priority
                                </Typography>
                                <Chip 
                                    label={ticket.priority} 
                                    size="small"
                                    color={ticket.priority === TicketPriority.high ? 'error' : 
                                           ticket.priority === TicketPriority.medium ? 'warning' : 'default'}
                                />
                            </Stack>
                        </Paper>
                    )}

                    <TextField
                        select
                        label="Type"
                        value={ticket.type}
                        onChange={(e) => setTicket({ ...ticket, type: e.target.value as TicketType })}
                        sx={{ flex: 1 }}
                    >
                        {Object.values(TicketType).map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    {isStaff ? (
                        <TextField
                            select
                            label="Status"
                            value={ticket.status}
                            onChange={(e) => setTicket({ ...ticket, status: e.target.value as TicketStatus })}
                            sx={{ flex: 1 }}
                        >
                            {Object.values(TicketStatus).map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    Status
                                </Typography>
                                <Chip 
                                    label={ticket.status}
                                    size="small"
                                    color={ticket.status === TicketStatus.closed ? 'default' :
                                           ticket.status === TicketStatus.in_progress ? 'primary' : 'warning'}
                                />
                            </Stack>
                        </Paper>
                    )}
                </Stack>

                {/* Assignee section */}
                <Stack spacing={2} sx={{ flexShrink: 0 }}>
                    {isStaff ? (
                        <TicketAssignee
                            ticketId={parseInt(id!)}
                            autoCRM={autoCRM}
                            currentAssignee={ticket.assignee}
                            onAssigneeUpdate={handleAssigneeUpdate}
                        />
                    ) : ticket.assignee && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PersonIcon color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    Assigned to
                                </Typography>
                                <Chip 
                                    label={`${ticket.assignee.first_name} ${ticket.assignee.last_name}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Stack>
                        </Paper>
                    )}
                </Stack>

                {/* Tabs section */}
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    minHeight: 0 // Important for proper scrolling
                }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                            <Tab icon={<MessageIcon />} label="Messages" />
                            {isStaff && (
                                <Tab icon={<AdminPanelSettingsIcon />} label="Internal Notes" />
                            )}
                            {isStaff && (
                                <Tab icon={<TagIcon />} label="Tags" />
                            )}
                            <Tab icon={<AttachFileIcon />} label="Files" />
                        </Tabs>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <TabPanel value={activeTab} index={0}>
                            <Messages
                                ticketId={parseInt(id!)}
                                autoCRM={autoCRM}
                                messages={ticket.messages?.filter(m => m.message_type === MessageType.public) || []}
                                onMessagesUpdate={() => handleMessagesUpdate(MessageType.public)}
                                messageType={MessageType.public}
                            />
                        </TabPanel>

                        {isStaff && (
                            <TabPanel value={activeTab} index={1}>
                                <Messages
                                    ticketId={parseInt(id!)}
                                    autoCRM={autoCRM}
                                    messages={ticket.messages?.filter(m => m.message_type === MessageType.agent_only) || []}
                                    onMessagesUpdate={() => handleMessagesUpdate(MessageType.agent_only)}
                                    messageType={MessageType.agent_only}
                                />
                            </TabPanel>
                        )}

                        {isStaff && (
                            <TabPanel value={activeTab} index={2}>
                                <TicketTags
                                    ticketId={parseInt(id!)}
                                    autoCRM={autoCRM}
                                    currentTags={ticket.tags || []}
                                    onTagsUpdate={handleTagsUpdate}
                                />
                            </TabPanel>
                        )}

                        <TabPanel value={activeTab} index={isStaff ? 3 : 1}>
                            <FileDisplay
                                ticketId={parseInt(id!)}
                                autoCRM={autoCRM}
                                files={files}
                                onFilesUpdate={async () => {
                                    const updatedFiles = await autoCRM.getTicketFiles(parseInt(id!));
                                    setFiles(updatedFiles);
                                }}
                                isStaff={isStaff}
                            />
                        </TabPanel>
                    </Box>
                </Box>

                {/* Bottom buttons section */}
                <Stack 
                    direction="row" 
                    spacing={2} 
                    justifyContent="flex-end"
                    sx={{ flexShrink: 0, pt: 2 }}
                >
                    <Button onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!ticket.title || !ticket.description}
                    >
                        {isNewTicket ? 'Create Ticket' : 'Save Changes'}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
