import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/SignInOutForm.css"
import logo from "../assets/logo.png"
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Signing up...");

    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    setMessage(
      res.ok
        ? data.message || "Sign up successful! Check your email."
        : `Error: ${data.error || "Sign up failed"}`
    );
  };

  return (
    <>
    {/* <form onSubmit={handleSignUp}>
      <h2>Sign Up</h2>
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
      <button type="submit">Sign Up</button>
      <p>{message}</p>
    </form> */}
    <Navbar />
    <div className="container-bg">
      <div className="container">
        <img src={logo} id="logo" />
        <h2>Welcome to TechNova!</h2>
        <h6>Register for an account here</h6>
        
        <Form onSubmit={handleSignUp}>
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
              <Button type="submit" className="submit-btn-txt"> Register </Button>
            </div>
        </Form>
        <p className="question-link">
            Have an account? <Link to="/signin">Login</Link>
        </p>
        <p>{message}</p>
      </div>
    </div>
    </>
  );
}
