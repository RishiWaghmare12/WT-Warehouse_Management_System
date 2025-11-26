import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Warehouse Management System</h1>
      </Link>
      <div className="nav-container">
        <nav>
          <Link 
            to="/warehouse" 
            className={`nav-link ${isActive('/warehouse') ? 'active' : ''}`}
          >
            Warehouse
          </Link>
          <Link 
            to="/items" 
            className={`nav-link ${isActive('/items') ? 'active' : ''}`}
          >
            Items
          </Link>
          <Link 
            to="/send-receive" 
            className={`nav-link ${isActive('/send-receive') ? 'active' : ''}`}
          >
            Send/Receive
          </Link>
          <Link 
            to="/transactions" 
            className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
          >
            Transactions
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
