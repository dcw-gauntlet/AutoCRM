from supabase import create_client
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Initialize Supabase client with service role key
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # Fixed typo
supabase = create_client(url, key)

def delete_all_tickets():
    """
    Delete all tickets and related records in the correct order to handle foreign key constraints
    """
    try:
        # 1. Delete ticket_tags (references tickets)
        print("Deleting ticket tags...")
        supabase.table('ticket_tags').delete().neq('ticket_id', 0).execute()

        # 2. Delete ticket_files (references tickets)
        print("Deleting ticket files...")
        supabase.table('ticket_files').delete().neq('ticket_id', 0).execute()

        # 3. Delete messages (references tickets)
        print("Deleting ticket messages...")
        supabase.table('messages').delete().neq('ticket_id', 0).execute()

        # 4. Finally, delete the tickets
        print("Deleting tickets...")
        result = supabase.table('tickets').delete().neq('id', 0).execute()
        
        print("Successfully deleted all tickets and related records")
        return result.data

    except Exception as e:
        print(f"Error deleting tickets: {str(e)}")
        return None

if __name__ == "__main__":
    delete_all_tickets() 