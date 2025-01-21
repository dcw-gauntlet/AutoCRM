import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Tag, Ticket, TicketPriority, TicketStatus, TicketType } from './types';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
}

export class AutoCRMClient {
    private client: SupabaseClient;
    private readonly BASE_TICKET_QUERY = `
        *,
        assignee:user_profiles!tickets_assignee_fkey (
            id,
            email,
            full_name
        ),
        ticket_tags!left (
            id,
            tags!left (
                id,
                tag
            )
        )
    `;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.client = createClient(supabaseUrl, supabaseKey);
    }

    private transformTicket(ticket: any): Ticket {
        return {
            ...ticket,
            created_at: new Date(ticket.created_at),
            updated_at: new Date(ticket.updated_at),
            tags: (ticket.ticket_tags || [])
                .map((tt: any) => tt.tags)
                .filter(Boolean)
                .map((tag: any) => ({ id: tag.id, tag: tag.tag }))
        };
    }

    private async queryTickets(query: any): Promise<Ticket[]> {
        const { data, error } = await query;
        
        if (error) {
            throw new Error(`Failed to fetch tickets: ${error.message}`);
        }

        return data.map(this.transformTicket);
    }

    async getAllTickets(): Promise<Ticket[]> {
        return this.queryTickets(
            this.client
                .from('tickets')
                .select(this.BASE_TICKET_QUERY)
        );
    }

    async getTicketsByCreator(creatorId: string): Promise<Ticket[]> {
        return this.queryTickets(
            this.client
                .from('tickets')
                .select(this.BASE_TICKET_QUERY)
                .eq('creator', creatorId)
        );
    }

    async getTicketsByAssignee(assigneeId: string): Promise<Ticket[]> {
        return this.queryTickets(
            this.client
                .from('tickets')
                .select(this.BASE_TICKET_QUERY)
                .eq('assignee', assigneeId)
        );
    }

    async getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
        return this.queryTickets(
            this.client
                .from('tickets')
                .select(this.BASE_TICKET_QUERY)
                .eq('status', status)
        );
    }

    async getTicketById(id: number): Promise<Ticket | null> {
        const { data, error } = await this.client
            .from('tickets')
            .select(this.BASE_TICKET_QUERY)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Failed to fetch ticket: ${error.message}`);
        }

        return data ? this.transformTicket(data) : null;
    }

    async createTicket(input: {
        title: string;
        description: string;
        priority: TicketPriority;
        type: TicketType;
        tags?: string[];
    }): Promise<Ticket> {
        // First create the ticket
        const { data: ticketData, error: ticketError } = await this.client
            .from('tickets')
            .insert([{
                title: input.title,
                description: input.description,
                priority: input.priority,
                type: input.type,
                creator: (await this.client.auth.getUser())?.data.user?.id,
                status: 'open' as TicketStatus
            }])
            .select()
            .single();

        if (ticketError) throw new Error(`Failed to create ticket: ${ticketError.message}`);

        // Then create the tag associations if there are any tags
        if (ticketData && ticketData.tags?.length > 0) {
            // Get tag IDs for all the tags
            const { data: tagData, error: tagQueryError } = await this.client
                .from('tags')
                .select('id, tag')
                .in('tag', ticketData.tags);

            if (tagQueryError) throw new Error(`Failed to query tags: ${tagQueryError.message}`);

            if (tagData) {
                const tagAssociations = tagData.map(tag => ({
                    ticket_id: ticketData.id,
                    tag_id: tag.id
                }));

                const { error: tagAssocError } = await this.client
                    .from('ticket_tags')
                    .insert(tagAssociations);

                if (tagAssocError) throw new Error(`Failed to associate tags: ${tagAssocError.message}`);
            }
        }

        return this.transformTicket(ticketData);
    }

    async updateTicket(ticketId: number, updates: {
        title?: string;
        description?: string;
        priority?: TicketPriority;
        type?: TicketType;
        status?: TicketStatus;
        assignee?: string | null;
        addedTags?: Tag[];
        removedTags?: Tag[];
    }): Promise<Ticket> {
        // Update ticket data
        const { error: ticketError } = await this.client
            .from('tickets')
            .update({
                title: updates.title,
                description: updates.description,
                priority: updates.priority,
                type: updates.type,
                status: updates.status,
                assignee: updates.assignee,
            })
            .eq('id', ticketId);

        if (ticketError) throw new Error(`Failed to update ticket: ${ticketError.message}`);

        // Handle tag changes
        if (updates.addedTags?.length) {
            const newAssociations = updates.addedTags.map(tag => ({
                ticket_id: ticketId,
                tag_id: tag.id
            }));

            const { error: addError } = await this.client
                .from('ticket_tags')
                .insert(newAssociations);

            if (addError) throw new Error(`Failed to add tags: ${addError.message}`);
        }

        if (updates.removedTags?.length) {
            const { error: removeError } = await this.client
                .from('ticket_tags')
                .delete()
                .eq('ticket_id', ticketId)
                .in('tag_id', updates.removedTags.map(t => t.id));

            if (removeError) throw new Error(`Failed to remove tags: ${removeError.message}`);
        }

        return this.getTicketById(ticketId) as Promise<Ticket>;
    }
    async getAllUsers(): Promise<UserProfile[]> {
        const { data, error } = await this.client
            .from('user_profiles')
            .select('id, email, full_name');

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        return data || [];
    }
}

export const client = new AutoCRMClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
);