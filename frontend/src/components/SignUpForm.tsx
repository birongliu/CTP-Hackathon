import { useState } from "react"
import { supabase } from "../supabaseClient"
import { Link } from "react-router-dom"
import Navbar from "./Navbar"

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({ email: email, password: password, })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Sign up successful! Please check your email to verify your account.')
    }
    setLoading(false)
  }

  return (
    <div>
        <Navbar />
      <h2>Sign Up</h2>
      <p>Create a new account.</p>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </div>
  )
}

export default SignUpForm