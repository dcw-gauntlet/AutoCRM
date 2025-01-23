import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Tag, Ticket, TicketPriority, TicketStatus, TicketType, TicketMessage, UserProfile, UserType } from './types';

export class AutoCRMClient {
    private client: SupabaseClient;
    private readonly BASE_TICKET_QUERY = `
        *,
        assignee:users!tickets_assignee_fkey (
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

    private readonly BASE_MESSAGE_QUERY = `
        id,
        created_at,
        updated_at,
        ticket_id,
        text,
        sender_id
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

    private transformMessage(message: any): TicketMessage {
        return {
            id: message.id,
            ticket_id: message.ticket_id,
            text: message.text,
            created_at: new Date(message.created_at),
            updated_at: new Date(message.updated_at),
            sender: message.sender
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

    private transformUserProfile(profile: any): UserProfile {
        return {
            ...profile,
            created_at: new Date(profile.created_at),
            updated_at: new Date(profile.updated_at)
        };
    }

    async createUserProfile(input: {
        user_id: string;
        email: string;
        full_name?: string;
        friendly_name?: string;
        avatar?: string;
        role?: UserType;
    }): Promise<UserProfile> {
        const { data, error } = await this.client
            .from('users')
            .insert([{
                user_id: input.user_id,
                email: input.email,
                full_name: input.full_name || null,
                friendly_name: input.friendly_name || null,
                avatar: input.avatar || null,
                role: input.role || 'agent'
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create user profile: ${error.message}`);
        }

        return this.transformUserProfile(data);
    }

    async updateUserProfile(userId: string, updates: {
        email?: string;
        full_name?: string | null;
        friendly_name?: string | null;
        avatar?: string | null;
        role?: UserType;
    }): Promise<UserProfile> {
        const { data, error } = await this.client
            .from('users')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }

        return this.transformUserProfile(data);
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch user profile: ${error.message}`);
        }

        return data ? this.transformUserProfile(data) : null;
    }

    async getAllUsers(): Promise<UserProfile[]> {
        const { data, error } = await this.client
            .from('users')
            .select('*');

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        return (data || []).map(this.transformUserProfile);
    }

    async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
        const { data, error } = await this.client
            .from('messages')
            .select(`
                ${this.BASE_MESSAGE_QUERY},
                sender:users!messages_sender_id_fkey (*)
            `)
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch ticket messages: ${error.message}`);
        }

        return (data || []).map(message => ({
            ...this.transformMessage(message),
            sender: this.transformUserProfile(message.sender)
        }));
    }

    async createTicketMessage(ticketId: number, text: string): Promise<TicketMessage> {
        const user = await this.client.auth.getUser();
        if (!user.data.user) {
            throw new Error('User must be authenticated to create messages');
        }

        const { data, error } = await this.client
            .from('ticket_messages')
            .insert([{
                ticket_id: ticketId,
                text: text,
                sender_id: user.data.user.id
            }])
            .select(this.BASE_MESSAGE_QUERY)
            .single();

        if (error) {
            throw new Error(`Failed to create message: ${error.message}`);
        }

        return this.transformMessage(data);
    }
}

export const client = new AutoCRMClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
);