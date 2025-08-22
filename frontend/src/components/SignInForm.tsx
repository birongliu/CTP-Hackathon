import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/SignInOutForm.css"
import logo from "../assets/logo.png"
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { supabase } from "../supabaseClient";
import Navbar from '../components/Navbar';

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

    interface LoginResponse {
      error?: string;
      [key: string]: unknown;
    }

    let data: LoginResponse = {};
    
    try {
      data = await res.json();
      if(data) {
        supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      }
    } catch {
      // Ignore JSON parse errors
    }

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

    <Navbar/>
    <div className="container-bg">
      <div className="container">
        <img src={logo} id="logo" />
        <h2>Welcome to TechNova!</h2>
        
        <Form onSubmit={handleSignIn}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="form-text">Email</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Enter email"  
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="form-text">Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </Form.Group>
          <div className="submit-btn">
            <Button type="submit" className="submit-btn-txt"> Login </Button>
          </div>
        </Form>
        <p className="question-link">
            Don't have an account? <Link to="/signup">Register here</Link>
        </p>
        <p>{message}</p>
      </div>
    </div>
    </>
  );
}
