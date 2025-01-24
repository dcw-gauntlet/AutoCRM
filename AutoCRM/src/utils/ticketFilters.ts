import { Ticket, TicketStatus, TicketPriority, TicketType } from '../AutoCRM';

export type SortField = keyof Ticket;
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
    status: TicketStatus | 'all';
    priority: TicketPriority | 'all';
    type: TicketType | 'all';
    search: string;
}

export function filterTickets(
    tickets: Ticket[], 
    filters: FilterState,
    sortField: SortField = 'updated_at',
    sortDirection: SortDirection = 'desc'
): Ticket[] {
    let filteredTickets = [...tickets];

    // Apply filters
    if (filters.status !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
    }
    if (filters.priority !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority);
    }
    if (filters.type !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.type === filters.type);
    }
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.title.toLowerCase().includes(searchLower) ||
            ticket.description.toLowerCase().includes(searchLower)
        );
    }

    // Sort tickets
    filteredTickets.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return filteredTickets;
} 