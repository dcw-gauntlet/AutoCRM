import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AutoCRM } from './AutoCRM'
import { createClient } from '@supabase/supabase-js'
import './index.css'

// read keys from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Create Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Create AutoCRM instance
const autoCRM = new AutoCRM(supabaseClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App autoCRM={autoCRM} />
  </React.StrictMode>,
)
