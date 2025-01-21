import { Ticket, TicketStatus, TicketPriority, TicketType } from '../types';

export type SortField = keyof Ticket;
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
    status: TicketStatus | 'all';
    priority: TicketPriority | 'all';
    type: TicketType | 'all';
    search: string;
}

export const filterTickets = (
    tickets: Ticket[],
    filters: FilterState,
    sortField: SortField,
    sortDirection: SortDirection
): Ticket[] => {
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
            ticket.description.toLowerCase().includes(searchLower) ||
            ticket.tags.some(tag => tag.tag.toLowerCase().includes(searchLower))
        );
    }

    // Apply sorting
    filteredTickets.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (aValue instanceof Date && bValue instanceof Date) {
            return sortDirection === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
        }

        if (typeof aValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue as string)
                : (bValue as string).localeCompare(aValue);
        }

        return 0;
    });

    return filteredTickets;
}; 