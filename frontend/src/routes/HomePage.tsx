<<<<<<< HEAD
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../supabaseClient"

function HomePage({ session }: { session: Session | null }) {
    const handleSignOut = async () => {
        await supabase.auth.signOut()
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>AI Agent Interview Prep</h1>
            {session ? (
                <div>
                    <p>You are signed in as: <strong>{session.user.email}</strong></p>
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            ) : (
                <p>You are not signed in. Please sign in or sign up.</p>
            )}
        </div>
    )
}

export default HomePage
=======
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadMe = async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setUserEmail(data.user?.email ?? null);
  };

  const handleSignOut = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUserEmail(null);
  };

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <div>
      <h1>Home</h1>
      {userEmail ? (
        <>
          <p>Welcome, {userEmail}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <p>You are not signed in.</p>
      )}
    </div>
  );
}
>>>>>>> EdisonCode
