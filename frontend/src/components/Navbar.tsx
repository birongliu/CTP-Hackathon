import { Link } from 'react-router-dom'
import '../styles/index.css'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar2 from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Navbar () {
  return (
    <>
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/signin'>Sign In</Link>
      <Link to='/signup'>Sign Up</Link>
    </nav>

    <Navbar2 expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar2.Brand href="#home">React-Bootstrap</Navbar2.Brand>
        <Navbar2.Toggle aria-controls="basic-navbar-nav" />
        <Navbar2.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar2.Collapse>
      </Container>
    </Navbar2>
    </>
  );
}

export default Navbar