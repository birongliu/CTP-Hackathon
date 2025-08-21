import { Link } from 'react-router-dom'
import '../styles/index.css'

function Navbar () {
  return (
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/signin'>Sign In</Link>
      <Link to='/signup'>Sign Up</Link>
    </nav>
  );
}

export default Navbar