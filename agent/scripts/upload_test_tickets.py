import csv
from supabase import create_client
import os
from datetime import datetime, UTC
from dotenv import load_dotenv
from pathlib import Path

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# AI User ID (all zeros)
AI_USER_ID = "00000000-0000-0000-0000-000000000000"

def load_tickets_from_csv(filename: str):
    """
    Load test tickets from TestTickets.csv and insert them into the tickets table
    CSV format should be:
    Title,Description,Expected queue
    """
    try:
        with open(filename, 'r') as file:
            reader = csv.DictReader(file)
            tickets = []
            
            for row in reader:
                now = datetime.now(UTC).isoformat()
                ticket = {
                    'title': row['Title'],
                    'description': row['Description'],
                    'priority': 'low',
                    'type': 'support',
                    'creator': AI_USER_ID,
                    'status': 'open',
                    'queue_id': 1,  # Default to intake queue
                    'assignee': AI_USER_ID,
                    'created_at': now,
                    'updated_at': now
                }
                tickets.append(ticket)
            
            # Batch insert all tickets
            result = supabase.table('tickets').insert(tickets).execute()
            print(f"Successfully inserted {len(tickets)} tickets")
            return result.data
            
    except Exception as e:
        print(f"Error loading tickets: {str(e)}")
        return None

if __name__ == "__main__":
    # Load from TestTickets.csv
    load_tickets_from_csv('data/TestTickets.csv') 