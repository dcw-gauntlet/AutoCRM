import { Box, Tabs, Tab } from '@mui/material';
import { TicketQueue } from './TicketQueue';
import { AutoCRM, User, UserRole } from './AutoCRM';
import { useEffect, useState } from 'react';
import { QueueAssignment } from './components/QueueAssignment';
import { QueueCreation } from './components/QueueCreation';

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
            sx={{ pt: 2 }}
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

    const isStaff = currentUser?.role !== UserRole.customer;
    const isAdmin = currentUser?.role === UserRole.admin;

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, newValue) => setActiveTab(newValue)}
                >
                    <Tab label="Your Tickets" />
                    <Tab label="Assigned to You" />
                    {isStaff && <Tab label="Queue Tickets" />}
                    {isAdmin && <Tab label="Queue Assignment" />}
                    {isAdmin && <Tab label="Create Queue" />}
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <TicketQueue 
                    title="Tickets You Created" 
                    tickets={createdTickets} 
                    onTicketSelect={onTicketSelect} 
                />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <TicketQueue 
                    title="Tickets Assigned to You" 
                    tickets={assignedTickets} 
                    onTicketSelect={onTicketSelect} 
                />
            </TabPanel>

            {isStaff && (
                <TabPanel value={activeTab} index={2}>
                    {userQueues.map(queue => (
                        <Box key={queue.id} sx={{ mb: 4 }}>
                            <TicketQueue 
                                title={`Queue: ${queue.name}`}
                                tickets={queueTickets.filter(ticket => 
                                    ticket.queue_id === queue.id
                                )}
                                onTicketSelect={onTicketSelect} 
                            />
                        </Box>
                    ))}
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
