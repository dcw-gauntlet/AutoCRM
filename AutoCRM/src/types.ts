// Base interface for common fields
interface BaseEntity {
    id: number;
    created_at: Date;   
    updated_at: Date;
}

// Ticket status and priority can be extended as needed
type TicketStatus = 'open' | 'in_progress' | 'closed' | 'on_hold';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketType = 'bug' | 'feature' | 'support' | 'inquiry';

interface TicketTag {
    id: number;
    tags: Tag;
}

interface Ticket extends BaseEntity {
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    creator: string;
    ticket_tags?: TicketTag[];
    tags: Tag[];  // This is the transformed array we use in components
    assignee: string | null;
}

interface Tag extends BaseEntity {
    tag: string;
}

interface Queue extends BaseEntity {
    name: string;
    description: string;
}

interface Assignment extends BaseEntity {
    ticket_id: string;
    queue_id: string;
    status: 'current' | 'past';
}

type UserType = 'customer' | 'worker' | 'admin';

interface User extends BaseEntity {
    type: UserType;
    full_name: string;
    email: string;
}

type PermissionType = 'add' | 'read' | 'edit';

interface QueuePermission extends BaseEntity {
    user_id: string;
    queue_id: string;
    permission_type: PermissionType;
}

interface TicketMessage extends BaseEntity {
    ticket_id: string;
    text: string;
    sender: UserProfile;
}

interface Following extends BaseEntity {
    ticket_id: string;
    user_id: string;
    status: 'active' | 'inactive';
}

export interface UserProfile {
    id: string;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    email: string;
    full_name: string | null;
    friendly_name: string | null;
    avatar: string | null;
    role: UserType;
}

// Export all types and interfaces
export type {
    BaseEntity,
    TicketStatus,
    TicketPriority,
    TicketType,
    Ticket,
    Tag,
    TicketTag,
    Queue,
    Assignment,
    UserType,
    User,
    PermissionType,
    QueuePermission,
    TicketMessage,
    Following
};
