import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Warehouse Management System</h1>
      </Link>
      <nav className="nav-container">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/warehouse" className="nav-link">Warehouse</Link>
        <Link to="/transactions" className="nav-link">Transactions</Link>
        <Link to="/reports" className="nav-link">Reports</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default Header; 