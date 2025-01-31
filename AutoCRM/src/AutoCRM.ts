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

export enum MessageType {
    public = 'public',
    agent_only = 'agent_only',
}

// Objects

export interface User {
    id: string;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    profile_picture_url?: string;
    friendly_name?: string;
}

export type Message = {
    id: string;
    text: string;
    created_at: Date;
    sender: User;
    ticket_id: number;
    message_type: MessageType;
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
    queue: Queue;

};

export interface Queue {
    id: number;
    created_at: string;
    name: string;
    description?: string;
}

export interface UserQueue {
    id: number;
    created_at: string;
    user_id: string;
    queue_id: number;
}

/**
 * # AutoCRM
 * 
 * This is the client to interact with supabase project.
 * 
 * Individual operations may involve multiple supabase operations.  All operations should be wrapped in a transaction.  If a transaction fails, the entire transaction should be rolled back.
 */


export class AutoCRM {
    private client;
    private userCache: Map<string, User>;
    static readonly DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

    constructor(supabaseClient: SupabaseClient) {
        this.client = supabaseClient;
        this.userCache = new Map();
    }

    async getTicketsByAssignee(userId: string): Promise<any[]> {
        const { data, error } = await this.client
            .from('tickets')
            .select(`
                *,
                queue:queues!queue_id(*),
                tags:ticket_tags(
                    id,
                    tags(
                        id,
                        tag
                    )
                )
            `)
            .eq('assignee', userId);

        if (error) throw error;

        // Fetch user data for creator and assignee
        const ticketsWithUsers = await Promise.all((data || []).map(async (ticket) => {
            const [creator, assignee] = await Promise.all([
                this.getUser(ticket.creator),
                this.getUser(ticket.assignee)
            ]);
            return {
                ...ticket,
                creator,
                assignee,
                tags: ticket.tags?.map((tt: any) => tt.tags) || []
            };
        }));

        return ticketsWithUsers;
    }

    async getTicketsByCreator(userId: string): Promise<any[]> {
        const { data, error } = await this.client
            .from('tickets')
            .select(`
                *,
                queue:queues!queue_id(*),
                tags:ticket_tags(
                    id,
                    tags(
                        id,
                        tag
                    )
                )
            `)
            .eq('creator', userId);

        if (error) throw error;

        // Transform the nested tags data structure
        return (data || []).map(ticket => ({
            ...ticket,
            tags: ticket.tags?.map((tt: any) => tt.tags) || []
        }));
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
                creator: ticket.creator?.id || AutoCRM.DEFAULT_USER_ID,
                assignee: ticket.assignee?.id || AutoCRM.DEFAULT_USER_ID,
                queue_id: ticket.queue?.id
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

    async getUser(id: string): Promise<User> {
        try {
            // Check cache first
            if (this.userCache.has(id)) {
                return this.userCache.get(id)!;
            }

            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                // If it's a "no rows returned" error, return the default user
                if (error.code === 'PGRST116') {
                    const defaultUser = await this.getUser(AutoCRM.DEFAULT_USER_ID);
                    this.userCache.set(id, defaultUser);
                    return defaultUser;
                }
                throw new Error(`Failed to get user: ${error.message}`);
            }

            this.userCache.set(id, data);
            return data;
        } catch (error) {
            if (error instanceof Error && !error.message.includes('Failed to get user')) {
                throw error;
            }
            return this.getUser(AutoCRM.DEFAULT_USER_ID);
        }
    }

    async getAllUsers(): Promise<User[]> {
        const { data, error } = await this.client
            .from('users')
            .select('*');
        
        if (error) throw error;
        return data || [];
    }

    async getMessagesOnTicket(ticket_id: number): Promise<Message[]> {
        try {
            // First get all messages for the ticket - remove the message_type filter
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
                        message_type: message.message_type
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
                .select(`
                    *,
                    queue:queues(*)
                `)
                .eq('id', ticket_id)
                .single();

            if (ticketError) {
                throw ticketError;
            }

            if (!ticketData) {
                return null; // Ticket not found
            }
            console.log("Here's some data:", ticketData);
            // Fetch Creator
            const creatorId = ticketData.creator === null || ticketData.creator === undefined 
                ? AutoCRM.DEFAULT_USER_ID 
                : ticketData.creator;
            const creator = await this.getUser(creatorId);
            if (!creator) {
                throw new Error(`Creator not found for ticket ${ticket_id}`);
            }

            // Fetch Assignee
            const assigneeId = ticketData.assignee === null || ticketData.assignee === undefined 
                ? AutoCRM.DEFAULT_USER_ID 
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
                queue: ticketData.queue
            };

            return ticket;

        } catch (error: any) {
            console.error("Error in getTicketDetails:", error);
            throw new Error(`Failed to get ticket details: ${error.message}`);
        }
    }


    async addMessage({ ticket_id, text, sender_id, message_type = MessageType.public }: 
        { ticket_id: number, text: string, sender_id: string, message_type?: MessageType }) {
        const { error } = await this.client
            .from('messages')
            .insert([{ ticket_id, text, sender_id, message_type }]);
            
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
            const { error } = await this.client
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
        try {
            const { data: { user } } = await this.client.auth.getUser();
            if (!user) return null;
            
            return await this.getUser(user.id);
        } catch (error) {
            // Only log actual errors, not expected conditions
            if (!(error instanceof Error && error.message.includes('Failed to get user'))) {
                console.error("Unexpected error getting current user:", error);
            }
            return null;
        }
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

    async uploadProfilePicture(userId: string, file: File): Promise<string> {
        // Sanitize filename: remove spaces and special characters
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const sanitizedFileName = `profile-${timestamp}.${fileExt}`;
        const filePath = `${userId}/${sanitizedFileName}`;
        
        const { error } = await this.client.storage
            .from('auto_crm_profile_pictures')
            .upload(filePath, file, {
                upsert: true,
                cacheControl: '3600'
            });

        if (error) {
            console.error('Storage error:', error);
            throw error;
        }

        // Get public URL using the correct path
        const { data: urlData } = this.client.storage
            .from('auto_crm_profile_pictures')
            .getPublicUrl(filePath);

        // Log the URL for debugging
        console.log('Generated public URL:', urlData.publicUrl);
        
        // Update user's profile_picture_url in the database
        await this.upsertUser({
            id: userId,
            profile_picture_url: urlData.publicUrl
        } as User);

        return urlData.publicUrl;
    }

    async signup(email: string, password: string): Promise<User> {
        const { data, error } = await this.client.auth.signUp({
            email,
            password
        });
        
        if (error) {
            throw new Error(`Failed to sign up: ${error.message}`);
        }
        
        if (!data.user) {
            throw new Error('No user data returned from signup');
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            created_at: new Date().toISOString(),
            first_name: '',
            last_name: '',
            role: UserRole.customer
        };
    }

    async initiateSignup(email: string, password: string): Promise<{ user: any, session: any }> {
        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/verify-email`,
            }
        });
        
        if (error) {
            throw error;
        }
        
        if (!data.user) {
            throw new Error('No user data returned from signup');
        }

        return data;
    }

    async checkEmailVerification(): Promise<boolean> {
        const { data: { session } } = await this.client.auth.getSession();
        return !!session?.user?.email_confirmed_at;
    }

    async resendVerificationEmail(email: string): Promise<void> {
        const { error } = await this.client.auth.resend({
            type: 'signup',
            email: email
        });
        
        if (error) {
            throw error;
        }
    }

    async signOut(): Promise<void> {
        try {
            await this.client.auth.signOut({ scope: 'global' });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    async uploadTicketFile(ticketId: number, file: File): Promise<string> {
        // Sanitize filename and create path
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const sanitizedFileName = `ticket-${ticketId}-${timestamp}.${fileExt}`;
        const filePath = `ticket-${ticketId}/${sanitizedFileName}`;
        
        // Upload the file
        const { error } = await this.client.storage
            .from('ticket_files')
            .upload(filePath, file, {
                upsert: true,
                cacheControl: '3600'
            });

        if (error) {
            console.error('Storage error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = this.client.storage
            .from('ticket_files')
            .getPublicUrl(filePath);

        // Add entry to ticket_files table
        const { error: dbError } = await this.client
            .from('ticket_files')
            .insert({
                ticket_id: ticketId,
                file_url: urlData.publicUrl,
                file_name: file.name,
                file_type: file.type
            });

        if (dbError) {
            throw dbError;
        }

        return urlData.publicUrl;
    }

    async getTicketFiles(ticketId: number): Promise<any[]> {
        const { data, error } = await this.client
            .from('ticket_files')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async deleteTicketFile(fileId: number): Promise<void> {
        const { data: fileData, error: fetchError } = await this.client
            .from('ticket_files')
            .select('file_url')
            .eq('id', fileId)
            .single();

        if (fetchError) throw fetchError;

        // Extract the path from the URL
        const url = new URL(fileData.file_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('ticket_files') + 1).join('/');

        // Delete from storage
        const { error: storageError } = await this.client.storage
            .from('ticket_files')
            .remove([filePath]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await this.client
            .from('ticket_files')
            .delete()
            .eq('id', fileId);

        if (dbError) throw dbError;
    }

    async assignUserToQueue(userId: string, queueId: number): Promise<void> {
        try {
            const { error } = await this.client
                .from('user_queues')
                .upsert({ 
                    user_id: userId, 
                    queue_id: queueId 
                }, {
                    onConflict: 'user_id,queue_id'  // This tells Supabase to handle duplicates
                });

            if (error) throw error;
        } catch (error: any) {
            console.error("Error assigning user to queue:", error);
            throw new Error(`Failed to assign user to queue: ${error.message}`);
        }
    }

    async unassignUserFromQueue(userId: string, queueId: number): Promise<void> {
        try {
            const { error } = await this.client
                .from('user_queues')
                .delete()
                .match({ user_id: userId, queue_id: queueId });

            if (error) throw error;
        } catch (error: any) {
            console.error("Error unassigning user from queue:", error);
            throw new Error(`Failed to unassign user from queue: ${error.message}`);
        }
    }

    async getTicketsByQueue(queueId: number): Promise<Ticket[]> {
        try {
            const { data, error } = await this.client
                .from('tickets')
                .select(`
                    *,
                    queue:queues!queue_id(*)
                `)
                .eq('queue_id', queueId);

            if (error) throw error;

            // Fetch user data for creator and assignee
            const ticketsWithUsers = await Promise.all((data || []).map(async (ticket) => {
                const [creator, assignee] = await Promise.all([
                    this.getUser(ticket.creator || AutoCRM.DEFAULT_USER_ID),
                    this.getUser(ticket.assignee || AutoCRM.DEFAULT_USER_ID)
                ]);
                
                return {
                    ...ticket,
                    creator,
                    assignee
                };
            }));

            return ticketsWithUsers;
        } catch (error: any) {
            console.error("Error in getTicketsByQueue:", error);
            throw new Error(`Failed to get tickets by queue: ${error.message}`);
        }
    }

    async upsertQueue(queue: Partial<Queue>): Promise<Queue> {
        try {
            const { data, error } = await this.client
                .from('queues')
                .upsert({
                    id: queue.id,
                    name: queue.name,
                    description: queue.description
                })
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from upsert');
            
            return data;
        } catch (error: any) {
            console.error("Error upserting queue:", error);
            throw new Error(`Failed to upsert queue: ${error.message}`);
        }
    }

    async getAllQueues(): Promise<Queue[]> {
        const { data, error } = await this.client
            .from('queues')
            .select('*');
        
        if (error) throw error;
        return data || [];
    }

    async getUserQueues(userId: string): Promise<Queue[]> {
        try {
            const { data, error } = await this.client
                .from('user_queues')
                .select(`
                    queue:queues(*)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            
            return (data || []).map(item => item.queue as unknown as Queue);
        } catch (error: any) {
            console.error("Error getting user queues:", error);
            throw new Error(`Failed to get user queues: ${error.message}`);
        }
    }

    async getQueueUsers(queueId: number): Promise<User[]> {
        try {
            const { data, error } = await this.client
                .from('user_queues')
                .select(`
                    user_id,
                    user:users(*)
                `)
                .eq('queue_id', queueId);

            if (error) throw error;
            
            // Extract the user data from the nested structure
            return (data || []).map(item => item.user as unknown as User);
        } catch (error: any) {
            console.error("Error getting queue users:", error);
            throw new Error(`Failed to get queue users: ${error.message}`);
        }
    }

    async assignTicketToQueue(ticketId: number, queueId: number): Promise<void> {
        try {
            const { error } = await this.client
                .from('tickets')
                .update({ queue_id: queueId })
                .eq('id', ticketId);

            if (error) throw error;
        } catch (error: any) {
            console.error("Error assigning ticket to queue:", error);
            throw new Error(`Failed to assign ticket to queue: ${error.message}`);
        }
    }

    async removeTicketFromQueue(ticketId: number): Promise<void> {
        try {
            const { error } = await this.client
                .from('tickets')
                .update({ queue_id: null })
                .eq('id', ticketId);

            if (error) throw error;
        } catch (error: any) {
            console.error("Error removing ticket from queue:", error);
            throw new Error(`Failed to remove ticket from queue: ${error.message}`);
        }
    }

    async isUserInQueue(userId: string, queueId: number): Promise<boolean> {
        try {
            const { data, error } = await this.client
                .from('user_queues')
                .select('id')
                .match({ user_id: userId, queue_id: queueId })
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
            return !!data;
        } catch (error: any) {
            console.error("Error checking if user is in queue:", error);
            throw new Error(`Failed to check if user is in queue: ${error.message}`);
        }
    }

    async createQueue(queue: { name: string; description?: string }): Promise<Queue> {
        const { data, error } = await this.client
            .from('queues')
            .insert([queue])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async getTickets(): Promise<Ticket[]> {
        try {
            const { data: ticketData, error } = await this.client
                .from('tickets')
                .select(`
                    *,
                    queue:queues(*),
                    assignee:users!tickets_assignee_fkey(*)
                `)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            return (ticketData || []).map(ticket => ({
                ...ticket,
                assignee: ticket.assignee || null,
                tags: ticket.tags?.map((tt: any) => tt.tags) || []
            }));
        } catch (error: any) {
            console.error("Error in getTickets:", error);
            throw new Error(`Failed to get tickets: ${error.message}`);
        }
    }

    async getQueue(queueId: number): Promise<Queue> {
        const { data, error } = await this.client
            .from('queues')
            .select('*')
            .eq('id', queueId)
            .single();
        
        if (error) throw error;
        return data;
    }
}