import { useEffect, useState } from 'react';
import '../styles/App.css';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import SignUpForm from '../components/SignUpForm';
import SignInForm from '../components/SignInForm';
import Behavioral from '../routes/Behavioral';

type MeResponse = { user: { id: string; email?: string } | null };

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  async function loadMe() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
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

  const renderPage = () => {
    switch (location.pathname) {
      case '/behavioral':
        return <Behavioral />
      case '/signin':
        return <SignInForm />; // these forms POST to /api/auth/login|signup
      case '/signup':
        return <SignUpForm />;
      case '/':
      default:
        // HomePage no longer needs Session; just pass email (or nothing)
        return <HomePage />; // or make HomePage read /api/auth/me itself
    }
  };

  return (
    <div>
      <Navbar />
      <main>
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
