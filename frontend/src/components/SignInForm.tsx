import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/SignInForm.css"
import logo from "../assets/logo.png"
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Signing in...");

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      setMessage(`Error: ${data?.error ?? res.statusText}`);
    } else {
      setMessage("Login successful!");
      navigate("/");
    }
  };

  return (
    <>
    {/* <form onSubmit={handleSignIn}>
      <h2>Sign In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign In</button>
      <p>{message}</p>
    </form> */}

    <img src={logo} id="logo" />
    <h2>Welcome to TechNova!</h2>
    
    <Form onSubmit={handleSignIn}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label htmlFor="email" className="form-text">Email</Form.Label>
        <Form.Control 
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
          type="password" 
          placeholder="Password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
      </Form.Group>
      <Button className="submit-btn" type="submit" > Login </Button>~
    </Form>
    <p>
        Don't have an account? <Link to="/signup">Sign-up</Link>
    </p>

    <p>{message}</p>
    </>
  );
}
