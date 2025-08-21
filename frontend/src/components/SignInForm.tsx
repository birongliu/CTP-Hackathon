import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import Navbar from "./Navbar"

import "../styles/SignInForm.css"
import logo from "../assets/logo.png"
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


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
    <>
    {/* <div>
      <Navbar />
      <h2>Welcome to TechNova!</h2>
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
    </div> */}

    <img src={logo} id="logo" />
    <h2>Welcome to TechNova!</h2>
    
    <Form onSubmit={handleSignIn}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label htmlFor="email" className="form-text">Email</Form.Label>
        <Form.Control 
          id="email" 
          type="email" 
          placeholder="Enter email"  
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label htmlFor="password" className="form-text">Password</Form.Label>
        <Form.Control 
          id="password" 
          type="password" 
          placeholder="Password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
      </Form.Group>
      <Button className="submit-btn" type="submit" disabled={loading} > {loading ? 'Logging In...' : 'Login'} </Button>
    </Form>
    <p>
        Don't have an account? <Link to="/signup">Sign-up</Link>
    </p>

    {message && <p style={{ color: 'red' }}>{message}</p>} {/* Error Message */}
    </>  
  )
}

export default SignInForm