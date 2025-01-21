import { 
    CheckCircle, 
    Error, 
    Warning, 
    Info, 
    PriorityHigh,
    BugReport,
    Help,
    Build,
    SvgIconComponent
} from '@mui/icons-material';
import { TicketStatus, TicketPriority, TicketType } from '../types';

export const statusConfig: Record<TicketStatus, { icon: SvgIconComponent; label: string }> = {
    open: { icon: Info, label: 'Open' },
    in_progress: { icon: Build, label: 'In Progress' },
    closed: { icon: CheckCircle, label: 'Closed' },
    on_hold: { icon: Warning, label: 'On Hold' }
};

export const priorityConfig: Record<TicketPriority, { icon: SvgIconComponent; label: string }> = {
    low: { icon: Info, label: 'Low Priority' },
    medium: { icon: Warning, label: 'Medium Priority' },
    high: { icon: Error, label: 'High Priority' },
    urgent: { icon: PriorityHigh, label: 'Urgent' }
};

const typeIcons: Record<TicketType, SvgIconComponent> = {
    bug: BugReport,
    feature: Build,
    support: Help,
    inquiry: Info
};

export const getTypeIcon = (type: TicketType): SvgIconComponent => {
    return typeIcons[type];
};

export const getStatusStyles = (status: TicketStatus) => ({
    display: 'flex',
    alignItems: 'center',
    color: status === 'closed' ? 'success.main' :
           status === 'in_progress' ? 'info.main' :
           status === 'on_hold' ? 'warning.main' :
           'text.secondary'
});

export const getPriorityStyles = (priority: TicketPriority) => ({
    display: 'flex',
    alignItems: 'center',
    color: priority === 'urgent' ? 'error.main' :
           priority === 'high' ? 'warning.main' :
           priority === 'medium' ? 'info.main' :
           'text.secondary'
}); 