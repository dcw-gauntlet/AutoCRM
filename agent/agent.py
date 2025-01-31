from typing import Dict, Any, Sequence, TypedDict, List
from langgraph.graph import Graph, StateGraph
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.tools import StructuredTool
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langgraph.prebuilt import create_react_agent

import os
from dotenv import load_dotenv

import supabase

import random
from uuid import uuid4
from datetime import datetime, timezone

from models import Ticket, TicketStatus, User, UserType

load_dotenv()

AGENT_EMAIL = os.getenv("AI_AGENT_EMAIL")
AGENT_PASSWORD = os.getenv("AI_AGENT_PASSWORD")

class Agent:
    def __init__(self):
        self.supabase = supabase.create_client(
            os.getenv("SUPABASE_URL"), 
            os.getenv("SUPABASE_KEY")
        )
        
        # Sign in as AI agent
        auth_response = self.supabase.auth.sign_in_with_password({
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        
        # Create or get AI Agent user
        self.agent_user = self._initialize_agent_user()
        
        roll_tool = StructuredTool.from_function(
            func=self.roll,
        )

        self.graph = create_react_agent(
            self.llm, 
            tools=[
                self.get_queue_tickets, 
                self.get_queue_by_name,
                self.add_message_to_ticket,
                self.get_queues,
                self.update_ticket_queue,
                self.update_ticket_priority,
                self.get_user,
                self.assign_ticket_to_user,
                self.get_tags,
                self.add_tags_to_ticket
            ]
        )

    def _initialize_agent_user(self) -> User:
        """Initialize or get the AI Agent user"""
        try:
            # Try to find existing AI Agent user
            response = self.supabase.table("users").select("*").eq("email", AGENT_EMAIL).execute()
            
            if response.data and len(response.data) > 0:
                return User(**response.data[0])
            
            # Create new AI Agent user if not found
            new_user = {
                "id": str(uuid4()),
                "email": "ai.agent@system.local",
                "friendly_name": "AI Support Agent",
                "role": UserType.AGENT,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            response = self.supabase.table("users").insert(new_user).execute()
            return User(**response.data[0])
            
        except Exception as e:
            raise Exception(f"Failed to initialize AI Agent user: {str(e)}")

    def roll(self, min: int = 1, max: int = 20) -> int:
        """Roll a random number between min and max (inclusive)"""
        result = random.randint(min, max)
        print(f"Rolling a die.  {min} to {max}. Result: {result}")
        return result


    def get_queue_tickets(self, queue_id: int, status: str) -> List[Dict]:
        """
        Get tickets for a specific queue filtered by status
        Args:
            queue_id: The ID of the queue to query
            status: The status to filter by (open, in_progress, closed, on_hold)
        Returns:
            List of tickets matching the criteria
        """
        try:
            response = self.supabase.table("tickets").select("*").eq("queue_id", queue_id).eq("status", status).execute()
            return response.data
        except Exception as e:
            return {"error": str(e)}


    def get_queue_by_name(self, queue_name: str) -> int:
        """
        Get the ID of a queue by its name
        Args:
            queue_name: The name of the queue to query
        Returns:
            The ID of the queue
        """
        # Make case-insensitive by using ilike
        response = self.supabase.table("queues").select("id").ilike("name", queue_name).execute()
        if not response.data:
            raise Exception(f"Queue '{queue_name}' not found")
        return response.data[0]["id"]

    def add_message_to_ticket(self, ticket_id: int, message: str, message_type: str = "public") -> Dict:
        """
        Add a message to a ticket
        Args:
            ticket_id: The ID of the ticket to add the message to
            message: The message text to add
            message_type: The type of message (public or agent_only)
        Returns:
            The created message record
        """
        try:
            new_message = {
                "ticket_id": ticket_id,
                "text": message,
                "sender_id": self.agent_user.id,
                "message_type": message_type,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            response = self.supabase.table("messages").insert(new_message).execute()
            return response.data[0]
            
        except Exception as e:
            return {"error": str(e)}

    def get_queues(self) -> List[Dict]:
        """
        Get all queues and their descriptions
        Returns:
            List of queues with their names and descriptions
        """
        try:
            response = self.supabase.table("queues").select("name,description,id").execute()
            return response.data
        except Exception as e:
            return {"error": str(e)}

    def update_ticket_queue(self, ticket_id: int, queue_id: int) -> Dict:
        """
        Update a ticket's queue
        Args:
            ticket_id: The ID of the ticket to update
            queue_id: The ID of the new queue
        Returns:
            The updated ticket record
        """
        try:
            response = self.supabase.table("tickets").update(
                {"queue_id": queue_id, "updated_at": datetime.now(timezone.utc).isoformat()}
            ).eq("id", ticket_id).execute()
            return response.data[0]
        except Exception as e:
            return {"error": str(e)}

    def get_ticket(self, ticket_id: int) -> Ticket:
        """
        Get a ticket by its ID
        Args:
            ticket_id: The ID of the ticket to get
        Returns:
            The ticket record
        """
        response = self.supabase.table("tickets").select("*").eq("id", ticket_id).execute()
        return Ticket(**response.data[0])

    def update_ticket_priority(self, ticket_id: int, priority: str) -> Dict:
        """
        Update a ticket's priority
        Args:
            ticket_id: The ID of the ticket to update
            priority: The new priority (low, medium, high, urgent)
        Returns:
            The updated ticket record
        """
        try:
            response = self.supabase.table("tickets").update({
                "priority": priority,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", ticket_id).execute()
            return response.data[0]
        except Exception as e:
            return {"error": str(e)}

    def classify_ticket(self, ticket_id: int):
        """
        Use the agent to classify the ticket into the appropriate queue
        """
        # Get ticket data first
        print(f"Classifying ticket {ticket_id}")
        ticket = self.get_ticket(ticket_id)
        
        # Load the classification prompt
        with open("prompts/Classify.md", "r") as f:
            prompt_template = f.read()
        
        # Create the prompt with ticket information and include the ticket_id
        prompt = prompt_template.format(ticket=ticket, ticket_id=ticket_id)
        
        messages = {
            "messages": [
                ("system", prompt),
                ("user", f"Please classify ticket #{ticket_id} into the appropriate queue.")
            ]
        }
        
        response = self.graph.invoke(messages)
        return response

    def get_user(self, user_id: str) -> Dict:
        """
        Get a user by their ID
        Args:
            user_id: The ID of the user to retrieve
        Returns:
            The user record
        """
        try:
            response = self.supabase.table("users").select("*").eq("id", user_id).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            return {"error": "User not found"}
        except Exception as e:
            return {"error": str(e)}

    def assign_ticket_to_user(self, ticket_id: int, user_id: str) -> Dict:
        """
        Assign a ticket to a user
        Args:
            ticket_id: The ID of the ticket to update
            user_id: The ID of the user to assign the ticket to
        Returns:
            The updated ticket record
        """
        try:
            response = self.supabase.table("tickets").update({
                "assignee": user_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", ticket_id).execute()
            return response.data[0]
        except Exception as e:
            return {"error": str(e)}

    def get_tags(self) -> List[Dict]:
        """
        Get all available tags
        Returns:
            List of tags with their IDs and descriptions
        """
        try:
            # Just get all columns since we're not sure of the schema
            response = self.supabase.table("tags").select("*").execute()
            return response.data
        except Exception as e:
            return {"error": str(e)}

    def add_tags_to_ticket(self, ticket_id: int, tag_ids: List[int]) -> Dict:
        """
        Add tags to a ticket
        Args:
            ticket_id: The ID of the ticket to update
            tag_ids: List of tag IDs to add to the ticket
        Returns:
            The created ticket_tags records
        """
        try:
            # Simplify to just the required fields
            ticket_tags = [
                {
                    "ticket_id": ticket_id,
                    "tag_id": tag_id,
                }
                for tag_id in tag_ids
            ]
            
            response = self.supabase.table("ticket_tags").insert(ticket_tags).execute()
            return response.data
            
        except Exception as e:
            return {"error": str(e)}



def print_stream(stream):
    for s in stream:
        message = s["messages"][-1]
        if isinstance(message, tuple):
            print(message)
        else:
            message.pretty_print()
