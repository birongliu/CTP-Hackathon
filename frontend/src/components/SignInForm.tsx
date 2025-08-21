import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import Navbar from "./Navbar"

function SignInForm () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email: email, password: password, });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div>
        <Navbar />
      <h2>Sign In</h2>
      <p>Sign in to your account.</p>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  )
}

export default SignInForm