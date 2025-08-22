import { useEffect, useState } from 'react';
import '../styles/App.css';
import { useLocation } from 'react-router-dom';
import HomePage from './HomePage';

type MeResponse = { user: { id: string; email?: string } | null };

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  useEffect(() => { loadMe(); }, []);
  useEffect(() => { if (location.pathname === '/') loadMe(); }, [location.pathname]);

  return (
    <div>
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {loading ? (
          <div style={{ padding: '1rem' }}>Loading…</div>
        ) : (
          <HomePage userEmail={userEmail} reloadUser={loadMe} />
        )}
      </main>
    </div>
  );
}

export default App;
