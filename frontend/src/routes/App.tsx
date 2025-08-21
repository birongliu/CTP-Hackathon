<<<<<<< HEAD
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
=======
import { useEffect, useState } from 'react';
import '../styles/App.css';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import SignUpForm from '../components/SignUpForm';
import SignInForm from '../components/SignInForm';

type MeResponse = { user: { id: string; email?: string } | null };

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  async function loadMe() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data: MeResponse = await res.json();
      setUserEmail(data.user?.email ?? null);
    } catch {
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  // Optional: refresh /me when you navigate back from sign in/up
  useEffect(() => {
    if (location.pathname === '/') loadMe();
  }, [location.pathname]);
>>>>>>> EdisonCode

  const renderPage = () => {
    switch (location.pathname) {
      case '/signin':
<<<<<<< HEAD
        return <SignInForm />
      case '/signup':
        return <SignUpForm />
      case '/':
      default:
        return <HomePage session={session} />
=======
        return <SignInForm />; // these forms POST to /api/auth/login|signup
      case '/signup':
        return <SignUpForm />;
      case '/':
      default:
        // HomePage no longer needs Session; just pass email (or nothing)
        return <HomePage />; // or make HomePage read /api/auth/me itself
>>>>>>> EdisonCode
    }
  };

  return (
    <div>
      <Navbar />
      <main>
<<<<<<< HEAD
        {renderPage()}
      </main>
    </div>
  )
}

export default App
=======
        {loading ? (
          <div style={{ padding: '1rem' }}>Loading…</div>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}

export default App;
>>>>>>> EdisonCode
