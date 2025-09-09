import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to the Warehouse Management System</h1>
        <p>Efficiently manage your warehouse inventory with our comprehensive solution</p>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <h3>Warehouse Overview</h3>
          <p>View all compartments and their contents at a glance</p>
          <Link to="/warehouse" className="feature-link">View Warehouse</Link>
        </div>
        
        <div className="feature-card">
          <h3>Send/Receive Items</h3>
          <p>Process incoming and outgoing items</p>
          <Link to="/send-receive" className="feature-link">Send/Receive Items</Link>
        </div>
        
        <div className="feature-card">
          <h3>Transaction History</h3>
          <p>Track all inventory movements and changes</p>
          <Link to="/transactions" className="feature-link">View Transactions</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
