from tembo_pgmq_python import PGMQueue, Message
from dotenv import load_dotenv
import os
from agent import Agent
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from queue import Queue
from langsmith import Client, traceable

load_dotenv()

# Initialize LangSmith client
client = Client()

class TicketHandler:

    def __init__(self):
        self.ticket_queue = Queue()
        self.ticket_message_queue = PGMQueue()
        
        self.get_tickets_thread = threading.Thread(target=self.polling)
        self.get_tickets_thread.start()

        self.handle_tickets_thread = threading.Thread(target=self.handle_tickets)
        self.handle_tickets_thread.start()

    @traceable
    def handle_ticket(self, ticket_id):
        """
        Process a single ticket. This function is decorated with @traceable,
        so LangSmith will automatically capture a trace for its execution.
        """
        agent = Agent()
        result = agent.classify_ticket(ticket_id)
        print(f"Processed ticket {ticket_id}")
        return result

    def polling(self):
        """
        Continuously polls tickets from the queue system and places ticket_ids into a thread-safe queue.
        Each successful poll is logged with Langsmith.
        """
        queue_client = PGMQueue()
        while True:
            try:
                ticket = queue_client.pop("ticket_creation")
                ticket_id = ticket.message['id']
                self.ticket_queue.put(ticket_id)
                print(f"Polled ticket {ticket_id}")
            except Exception as e:
                print("No tickets available, sleeping...", e)
                time.sleep(1)
                continue

    def handle_tickets(self):
        """
        Continuously processes tickets from the ticket_queue using a ThreadPoolExecutor.
        Each ticket processing is instrumented via the handle_ticket method.
        """
        with ThreadPoolExecutor(max_workers=10) as executor:
            while True:
                ticket_id = self.ticket_queue.get()
                executor.submit(self.handle_ticket, ticket_id)

th = TicketHandler()

th.get_tickets_thread.join()
th.handle_tickets_thread.join()
