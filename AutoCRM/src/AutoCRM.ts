import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Enums
export enum TicketPriority {
    low = 'low',
    medium = 'medium',
    high = 'high',
    urgent = 'urgent',
}

export enum TicketStatus {
    open = 'open',
    in_progress = 'in_progress',
    closed = 'closed',
    on_hold = 'on_hold',
}

export enum TicketType {
    bug = 'bug',
    feature = 'feature',
    support = 'support',
    inquiry = 'inquiry',
}

export enum UserRole {
    customer = 'customer',
    agent = 'agent',
    admin = 'admin',
}

// Objects

export type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
};

export type Message = {
    id: string;
    text: string;
    created_at: Date;
    sender: User;
    ticket_id: number;
};

export type Tag = {
    id: number;
    tag: string;
};

export type Ticket = {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    messages: Message[];
    tags: Tag[];
    creator: User;
    assignee: User;
};


/**
 * # AutoCRM
 * 
 * This is the client to interact with supabase project.
 * 
 * Individual operations may involve multiple supabase operations.  All operations should be wrapped in a transaction.  If a transaction fails, the entire transaction should be rolled back.
 */


export class AutoCRM {
    public client: SupabaseClient;
    static readonly DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

    constructor(client: SupabaseClient) {
        
        this.client = client;
    }

    async getTicketsByCreator(userId: string): Promise<Ticket[]> {
        try {
            const { data, error } = await this.client
                .from('tickets')
                .select('*')
                .eq('creator', userId);

            if (error) {
                throw error;
            }

            // console.log("data:", data);

            return data as any;
        } catch (error: any) {
            console.error("Error in getTicketsByCreator:", error);
            throw new Error(`Failed to get tickets by creator: ${error.message}`);
        }
    }

    async getTicketsByAssignee(userId: string): Promise<Ticket[]> {
        try {
            const { data, error } = await this.client
                .from('tickets')
                .select('*')
                .eq('assignee', userId);

            if (error) {
                throw error;
            }

            return data as any;
        } catch (error: any) {
            console.error("Error in getTicketsByAssignee:", error);
            throw new Error(`Failed to get tickets by assignee: ${error.message}`);
        }
    }

    async upsertTicket(ticket: Partial<Ticket>): Promise<Ticket> {
        try {
            const ticketData = {
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                priority: ticket.priority,
                type: ticket.type,
                status: ticket.status,
                creator: ticket.creator?.id || this.DEFAULT_USER_ID,
                assignee: ticket.assignee?.id || this.DEFAULT_USER_ID,
            };

            const { data, error } = await this.client
                .from('tickets')
                .upsert(ticketData)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from upsert');
            
            return data;
        } catch (error: any) {
            console.error("Error in upsertTicket:", error);
            throw new Error(`Failed to upsert ticket: ${error.message}`);
        }
    }

    async getUser(userId: string): Promise<User | null> {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            if (!data) return null;

            return {
                id: data.id,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                role: data.role as UserRole
            };
        } catch (error: any) {
            console.error("Error in getUser:", error);
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*');

            if (error) {
                throw error;
            }

            return data as any;
        } catch (error: any) {
            console.error("Error in getAllUsers:", error);
            throw new Error(`Failed to get all users: ${error.message}`);
        }
    }

    async getMessagesOnTicket(ticket_id: number): Promise<Message[]> {
        try {
            // First get all messages for the ticket
            const { data: messageData, error: messageError } = await this.client
                .from('messages')
                .select('*')
                .eq('ticket_id', ticket_id)
                .order('created_at', { ascending: true });

            if (messageError) {
                throw messageError;
            }

            // Then get user details for each message
            const messages: Message[] = await Promise.all(
                messageData.map(async (message: any) => {
                    const sender = await this.getUser(message.sender_id || AutoCRM.DEFAULT_USER_ID);
                    if (!sender) {
                        throw new Error(`Sender not found for message ${message.id}`);
                    }
                    return {
                        id: message.id,
                        text: message.text,
                        created_at: new Date(message.created_at),
                        sender: sender,
                        ticket_id: message.ticket_id,
                    };
                })
            );

            return messages;
        } catch (error: any) {
            console.error("Error in getMessagesOnTicket:", error);
            throw new Error(`Failed to get messages on ticket: ${error.message}`);
        }
    }


    async getTicketDetails(ticket_id: number): Promise<Ticket | null> {
        try {
            const { data: ticketData, error: ticketError } = await this.client
                .from('tickets')
                .select('*')
                .eq('id', ticket_id)
                .single();

            if (ticketError) {
                throw ticketError;
            }

            if (!ticketData) {
                return null; // Ticket not found
            }

            // Fetch Creator
            const creatorId = ticketData.creator === null || ticketData.creator === undefined 
                ? this.DEFAULT_USER_ID 
                : ticketData.creator;
            const creator = await this.getUser(creatorId);
            if (!creator) {
                throw new Error(`Creator not found for ticket ${ticket_id}`);
            }

            // Fetch Assignee
            const assigneeId = ticketData.assignee === null || ticketData.assignee === undefined 
                ? this.DEFAULT_USER_ID 
                : ticketData.assignee;
            const assignee = await this.getUser(assigneeId);
            if (!assignee) {
                throw new Error(`Assignee not found for ticket ${ticket_id}`);
            }

            // Fetch Messages
            const messages = await this.getMessagesOnTicket(ticket_id);

            // Fetch Tags
            const tags = await this.getTagsForTicket(ticket_id);

            const ticket: Ticket = {
                id: ticketData.id,
                created_at: new Date(ticketData.created_at),
                updated_at: new Date(ticketData.updated_at),
                title: ticketData.title,
                description: ticketData.description,
                status: ticketData.status,
                priority: ticketData.priority,
                type: ticketData.type,
                messages: messages,
                tags: tags,
                creator: creator,
                assignee: assignee,
            };

            return ticket;

        } catch (error: any) {
            console.error("Error in getTicketDetails:", error);
            throw new Error(`Failed to get ticket details: ${error.message}`);
        }
    }


    async addMessage({ ticket_id, text, sender_id }: { ticket_id: number, text: string, sender_id: string }) {
        const { error } = await this.client
            .from('messages')
            .insert([{ ticket_id, text, sender_id }]);
            
        if (error) {
            throw new Error(`Failed to add message: ${error.message}`);
        }
    }


    async createTag(tag: string): Promise<Tag> {
        try {
            const { data, error } = await this.client
                .from('tags')
                .insert([{ tag }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data as any;
        } catch (error: any) {
            console.error("Error in createTag:", error);
            throw new Error(`Failed to create tag: ${error.message}`);
        }
    }


    async addTag(ticket_id: number, tag_id: number): Promise<void> {
        try {
            const { data, error } = await this.client
                .from('ticket_tags')
                .insert([{ ticket_id, tag_id }]);

            if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error("Error in addTag:", error);
            throw new Error(`Failed to add tag to ticket: ${error.message}`);
        }
    }

    async getTagsForTicket(ticket_id: number): Promise<any[]> {
        try {
            const { data, error } = await this.client
                .from('ticket_tags')
                .select(`
                    tag_id,
                    tags (
                        id,
                        tag
                    )
                `)
                .eq('ticket_id', ticket_id);

            if (error) {
                throw error;
            }

            // Map to just the tag data
            return data.map((item: any) => item.tags);
        } catch (error: any) {
            console.error("Error in getTagsForTicket:", error);
            throw new Error(`Failed to get tags for ticket: ${error.message}`);
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await this.client.auth.getUser();
        if (!user) return null;
        console.log("!!!!!!! user:", user);
        return this.getUser(user.id);
    }

    async login(email: string, password: string) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            throw new Error(`Failed to login: ${error.message}`);
        }
        
        // Ensure we have user data
        if (data.user) {
            const userData = await this.getUser(data.user.id);
            if (!userData) {
                throw new Error('User data not found after login');
            }
            return userData;
        }
        throw new Error('No user data returned from login');
    }

    async upsertUser(user: { 
        email: string, 
        first_name: string, 
        last_name: string, 
        role: string,
        id: string 
    }) {
        const { error } = await this.client
            .from('users')
            .upsert({ ...user }, { onConflict: 'id' });
            
        if (error) {
            throw new Error(`Failed to upsert user: ${error.message}`);
        }

        return user;
    }

    async getAllTags(): Promise<Tag[]> {
        try {
            const { data, error } = await this.client
                .from('tags')
                .select('*')
                .order('tag', { ascending: true });

            if (error) {
                throw error;
            }

            return data;
        } catch (error: any) {
            console.error("Error in getAllTags:", error);
            throw new Error(`Failed to get all tags: ${error.message}`);
        }
    }

    async removeTag(ticket_id: number, tag_id: number): Promise<void> {
        try {
            const { error } = await this.client
                .from('ticket_tags')
                .delete()
                .match({ 
                    ticket_id: ticket_id,
                    tag_id: tag_id 
                });

            if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error("Error in removeTag:", error);
            throw new Error(`Failed to remove tag: ${error.message}`);
        }
    }
}