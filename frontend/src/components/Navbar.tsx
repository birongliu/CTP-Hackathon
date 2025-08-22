import { Link } from 'react-router-dom'
import React, { useState } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';

import '../styles/index.css'
import '../styles/Navbar.css'
import Logo from '../assets/logo.png'
import ProfilePic from '../assets/profile-pic.png'

import Nav from 'react-bootstrap/Nav';
import Navbar2 from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

export default function Navbar () {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  return (
    <>
    <Navbar2 expand="lg" className="bg-body-tertiary">
        <img src={Logo} className="logo" onClick={handleShow}></img>
        {show && (
          <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton>
            <img src={Logo} className="logo" onClick={handleShow}></img>
            </Offcanvas.Header>
            <Offcanvas.Title>New Chat</Offcanvas.Title>
            <Offcanvas.Title>History</Offcanvas.Title>
            <Offcanvas.Body>
              Some text as placeholder. In real life you can have the elements you
              have chosen. Like, text, images, lists, etc.
            </Offcanvas.Body>
          </Offcanvas>

        )}

        <Navbar2.Brand href="#home">TechNova</Navbar2.Brand>
        <Navbar2.Toggle aria-controls="basic-navbar-nav" />
        <Navbar2.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/behavioral">Behavioral</Nav.Link>
            
            <NavDropdown title="Technical" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Software Engineering</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Data Science</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Product Management</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar2.Collapse>

        <DropdownButton
          id="dropdown-profile-btn"
          title={
            <img
              src={ProfilePic}
              alt="Profile"
              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
            />
          }
        >
          <Dropdown.Item as={Link} to="/signin">Login</Dropdown.Item>
          <Dropdown.Item as={Link} to="/signup">Sign-up</Dropdown.Item>
        </DropdownButton>
    </Navbar2>
    </>
  );
}