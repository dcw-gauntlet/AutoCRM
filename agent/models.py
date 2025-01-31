from enum import Enum
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    ON_HOLD = "on_hold"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketType(str, Enum):
    BUG = "bug"
    FEATURE = "feature"
    SUPPORT = "support"
    INQUIRY = "inquiry"

class Ticket(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: TicketPriority
    type: TicketType
    queue_id: Optional[int] = None
    assignee: Optional[str] = None
    creator: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class UserType(str, Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    ADMIN = "admin"

class User(BaseModel):
    id: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    friendly_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    role: Optional[UserType] = None
    created_at: datetime 