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