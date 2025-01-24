import { 
    CheckCircle, 
    Error, 
    Warning, 
    Info,
    BugReport,
    LiveHelp,
    Construction,
    Help
} from '@mui/icons-material';
import { TicketStatus, TicketPriority, TicketType } from '../AutoCRM';

export const statusConfig = {
    [TicketStatus.open]: { icon: Info },
    [TicketStatus.in_progress]: { icon: Construction },
    [TicketStatus.closed]: { icon: CheckCircle },
    [TicketStatus.on_hold]: { icon: Warning }
};

export const priorityConfig = {
    [TicketPriority.low]: { icon: Info },
    [TicketPriority.medium]: { icon: Warning },
    [TicketPriority.high]: { icon: Error },
    [TicketPriority.urgent]: { icon: Error }
};

export const getStatusStyles = (status: TicketStatus) => ({
    color: status === TicketStatus.closed ? 'success.main' :
           status === TicketStatus.in_progress ? 'primary.main' :
           status === TicketStatus.on_hold ? 'warning.main' : 
           'info.main'
});

export const getPriorityStyles = (priority: TicketPriority) => ({
    color: priority === TicketPriority.high ? 'error.main' :
           priority === TicketPriority.medium ? 'warning.main' :
           'info.main'
});

export const getTypeIcon = (type: TicketType) => {
    switch (type) {
        case TicketType.bug:
            return BugReport;
        case TicketType.feature:
            return Construction;
        case TicketType.support:
            return LiveHelp;
        default:
            return Help;
    }
}; 