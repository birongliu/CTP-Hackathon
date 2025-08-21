import { useEffect, useState } from 'react'
import '../styles/App.css'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'
import { useLocation } from 'react-router-dom'
import HomePage from './HomePage'
import SignUpForm from '../components/SignUpForm'
import SignInForm from '../components/SignInForm'

function App () {
  const [session, setSession] = useState<Session | null>(null)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe()
  }, [])

  const renderPage = () => {
    switch (location.pathname) {
      case '/signin':
        return <SignInForm />
      case '/signup':
        return <SignUpForm />
      case '/':
      default:
        return <HomePage session={session} />
    }
  };

  return (
    <div>
      <Navbar />
      <main>
        {renderPage()}
      </main>
    </div>
  )
}

export default App
