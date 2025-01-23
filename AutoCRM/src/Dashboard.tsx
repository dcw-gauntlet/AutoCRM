import { Box } from '@mui/material';
import { TicketQueue } from './TicketQueue';
import { AutoCRM } from './AutoCRM';
import { useEffect, useState } from 'react';

interface DashboardProps {
    autoCRM: AutoCRM;
    onTicketSelect: (ticketId: number) => void;
}

export function Dashboard({ autoCRM, onTicketSelect }: DashboardProps) {
    const [assignedTickets, setAssignedTickets] = useState<any[]>([]);
    const [createdTickets, setCreatedTickets] = useState<any[]>([]);
    
    useEffect(() => {
        const loadUserTickets = async () => {
            const currentUser = await autoCRM.getCurrentUser();
            if (!currentUser) return;

            console.log('Loading tickets for user:', currentUser.id);

            try {
                const [assigned, created] = await Promise.all([
                    autoCRM.getTicketsByAssignee(currentUser.id),
                    autoCRM.getTicketsByCreator(currentUser.id)
                ]);

                console.log('Assigned tickets:', assigned);
                console.log('Created tickets:', created);

                setAssignedTickets(assigned);
                setCreatedTickets(created);
            } catch (error) {
                console.error('Error loading tickets:', error);
            }
        };

        loadUserTickets();
    }, [autoCRM]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TicketQueue 
                title="Assigned to you" 
                tickets={assignedTickets} 
                onTicketSelect={onTicketSelect} 
            />
            
            <TicketQueue 
                title="Your tickets" 
                tickets={createdTickets} 
                onTicketSelect={onTicketSelect} 
            />
        </Box>
    );
}
