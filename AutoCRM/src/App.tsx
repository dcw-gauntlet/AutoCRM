import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import Login from './Auth/Login'
import { Typography, Container, Box } from '@mui/material'
import './App.css'
import { Sidebar } from './Sidebar/Sidebar'
import { Dashboard } from './Dashboard'
import { NewTicket } from './NewTicket'
import { TicketDetails } from './TicketDetails'
import { AutoCRMClient } from './client'
import { Ticket } from './types'

// Update the ActiveComponent type to include ticketDetails
type ActiveComponent = 'dashboard' | 'newTicket' | 'ticketDetails'

// Add an interface for the component state to include the ticket ID
interface ComponentState {
  component: ActiveComponent;
  ticketId?: number;
}

// Move client creation outside component
const client = new AutoCRMClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeComponent, setActiveComponent] = useState<ComponentState>({ 
    component: 'dashboard' 
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Modified tickets effect with proper dependencies
  useEffect(() => {
    let mounted = true;

    const loadTickets = async () => {
      if (session) {
        try {
          const fetchedTickets = await client.getAllTickets()
          if (mounted) {
            setTickets(fetchedTickets)
          }
        } catch (error) {
          console.error('Error fetching tickets:', error)
        }
      }
    }

    loadTickets()
    return () => { mounted = false }
  }, [session]) // Only depend on session changes

  const navigateToDashboard = () => {
    setActiveComponent({ component: 'dashboard' });
  };

  const renderActiveComponent = () => {
    switch (activeComponent.component) {
      case 'dashboard':
        return <Dashboard 
          tickets={tickets}
          onTicketSelect={(ticketId) => 
            setActiveComponent({ component: 'ticketDetails', ticketId })} 
        />
      case 'newTicket':
        return <NewTicket onComplete={navigateToDashboard} />
      case 'ticketDetails':
        return <TicketDetails 
          ticketId={activeComponent.ticketId!} 
          onComplete={navigateToDashboard}
        />
      default:
        return <Dashboard 
          tickets={tickets} 
          onTicketSelect={(ticketId) => 
            setActiveComponent({ component: 'ticketDetails', ticketId })} 
        />
    }
  }

  if (loading) {
    return <Typography>Loading...</Typography>
  }

  if (!session) {
    return <Login />
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: (theme) => theme.palette.background.default
    }}>
      <Sidebar onNavigate={(component) => setActiveComponent({ component })} />
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{ 
            width: '100%'
          }}
        >
          {renderActiveComponent()}
        </Container>
      </Box>
    </Box>
  )
}

export default App