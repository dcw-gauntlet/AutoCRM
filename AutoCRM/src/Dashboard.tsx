import { Box } from '@mui/material';
import { TicketQueue } from './TicketQueue';
import { Ticket } from './types';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { AutoCRMClient } from './client';

// Use the shared client instance
const client = new AutoCRMClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
);

interface DashboardProps {
    tickets: Ticket[];
    onTicketSelect: (ticketId: number) => void;
}

export const Dashboard = ({ onTicketSelect }: DashboardProps) => {
    const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
    const [createdTickets, setCreatedTickets] = useState<Ticket[]>([]);
    
    useEffect(() => {
        const loadUserTickets = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            console.log('Loading tickets for user:', user.id);

            try {
                const [assigned, created] = await Promise.all([
                    client.getTicketsByAssignee(user.id),
                    client.getTicketsByCreator(user.id)
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
    }, []);

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
};
