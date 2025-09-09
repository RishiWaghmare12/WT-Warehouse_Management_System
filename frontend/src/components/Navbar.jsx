import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <header className="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Warehouse Management System</h1>
      </Link>
      <div className="nav-container">
        <nav>
          <Link to="/warehouse" className="nav-link">Warehouse</Link>
          <Link to="/send-receive" className="nav-link">Send/Receive</Link>
          <Link to="/transactions" className="nav-link">Transactions</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
