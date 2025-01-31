import { Box, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Chip, Checkbox } from '@mui/material';
import { AutoCRM, User, UserRole } from './AutoCRM';
import { useEffect, useState } from 'react';
import { QueueAssignment } from './components/QueueAssignment';
import { QueueCreation } from './components/QueueCreation';
import { TicketTable } from './TicketTable';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface DashboardProps {
    autoCRM: AutoCRM;
    onTicketSelect: (ticketId: number) => void;
}

interface TabPanelProps {
    children: JSX.Element | JSX.Element[];
    value: number;
    index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    if (value !== index) return null;
    return (
        <Box 
            role="tabpanel"
            sx={{ 
                height: 'calc(100vh - 200px)', // Account for tabs and app bar
                overflow: 'hidden',
                pt: 2 
            }}
        >
            {children}
        </Box>
    );
}

export function Dashboard({ autoCRM, onTicketSelect }: DashboardProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [assignedTickets, setAssignedTickets] = useState<any[]>([]);
    const [createdTickets, setCreatedTickets] = useState<any[]>([]);
    const [queueTickets, setQueueTickets] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userQueues, setUserQueues] = useState<any[]>([]);
    const [selectedQueueIds, setSelectedQueueIds] = useState<number[]>([]);
    
    const loadUserData = async () => {
        const user = await autoCRM.getCurrentUser();
        if (!user) return;
        setCurrentUser(user);

        try {
            // Load tickets
            const [assigned, created] = await Promise.all([
                autoCRM.getTicketsByAssignee(user.id),
                autoCRM.getTicketsByCreator(user.id)
            ]);
            setAssignedTickets(assigned);
            setCreatedTickets(created);

            // If user is staff, load queue data
            if (user.role !== UserRole.customer) {
                const queues = await autoCRM.getUserQueues(user.id);
                setUserQueues(queues);
                
                // Load tickets from all user's queues
                const queueTicketsArrays = await Promise.all(
                    queues.map(queue => autoCRM.getTicketsByQueue(queue.id))
                );
                // Flatten and deduplicate tickets
                const allQueueTickets = Array.from(new Set(
                    queueTicketsArrays.flat().map(ticket => ticket.id)
                )).map(id => 
                    queueTicketsArrays.flat().find(ticket => ticket.id === id)
                );
                setQueueTickets(allQueueTickets);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    // Initial load
    useEffect(() => {
        loadUserData();
    }, [autoCRM]);

    // Refresh data when tab changes
    useEffect(() => {
        loadUserData();
    }, [activeTab]);

    // Filter tickets based on selected queues
    const filteredQueueTickets = queueTickets.filter(ticket => 
        selectedQueueIds.length === 0 || // Show all if nothing selected
        selectedQueueIds.includes(ticket.queue?.id)
    );

    const isStaff = currentUser?.role !== UserRole.customer;
    const isAdmin = currentUser?.role === UserRole.admin;

    return (
        <Box sx={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                flexShrink: 0  // Prevent tabs from shrinking
            }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"  // Ensure tabs don't wrap or overflow
                    scrollButtons="auto"
                >
                    <Tab label="Your Tickets" />
                    <Tab label="Assigned to You" />
                    {isStaff && <Tab label="Queue Tickets" />}
                    {isAdmin && <Tab label="Queue Assignment" />}
                    {isAdmin && <Tab label="Create Queue" />}
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <TicketTable 
                    title="Tickets You Created" 
                    tickets={createdTickets} 
                    autoCRM={autoCRM} 
                />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <TicketTable 
                    title="Tickets Assigned to You" 
                    tickets={assignedTickets} 
                    autoCRM={autoCRM} 
                />
            </TabPanel>

            {isStaff && (
                <TabPanel value={activeTab} index={2}>
                    <FormControl 
                        fullWidth 
                        sx={{ mb: 2 }}
                    >
                        <InputLabel id="queue-select-label">Select Queues</InputLabel>
                        <Select
                            labelId="queue-select-label"
                            multiple
                            value={selectedQueueIds}
                            onChange={(event) => {
                                setSelectedQueueIds(typeof event.target.value === 'string' 
                                    ? [] 
                                    : event.target.value as number[]);
                            }}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.length === 0 ? (
                                        <Chip label="All Queues" />
                                    ) : (
                                        selected.map((queueId) => (
                                            <Chip
                                                key={queueId}
                                                label={userQueues.find(q => q.id === queueId)?.name || 'Unknown Queue'}
                                            />
                                        ))
                                    )}
                                </Box>
                            )}
                        >
                            {userQueues.map((queue) => (
                                <MenuItem key={queue.id} value={queue.id}>
                                    <Checkbox 
                                        checked={selectedQueueIds.indexOf(queue.id) > -1}
                                        icon={<CheckBoxOutlineBlankIcon />}
                                        checkedIcon={<CheckBoxIcon />}
                                    />
                                    {queue.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TicketTable 
                        title="Queue Tickets"
                        tickets={filteredQueueTickets}
                        autoCRM={autoCRM} 
                    />
                </TabPanel>
            )}

            {isAdmin && (
                <TabPanel value={activeTab} index={3}>
                    <QueueAssignment autoCRM={autoCRM} />
                </TabPanel>
            )}

            {isAdmin && (
                <TabPanel value={activeTab} index={4}>
                    <QueueCreation autoCRM={autoCRM} />
                </TabPanel>
            )}
        </Box>
    );
}
