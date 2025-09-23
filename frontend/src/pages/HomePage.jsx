import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/Dashboard/StatsCard';
import SimpleChart from '../components/Charts/SimpleChart';
import { warehouseApi } from '../services/api';
import '../components/Dashboard/Dashboard.css';

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    totalCompartments: 0,
    lowStockItems: 0,
    recentTransactions: 0,
    compartmentUtilization: [],
    stockLevels: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsResponse, compartmentsResponse, transactionsResponse] = await Promise.all([
        warehouseApi.getAllItems(),
        warehouseApi.getCompartments(),
        warehouseApi.getAllTransactions()
      ]);

      if (itemsResponse.success && compartmentsResponse.success && transactionsResponse.success) {
        const items = Array.isArray(itemsResponse.data?.data) ? itemsResponse.data.data : 
                     Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
        const compartments = Array.isArray(compartmentsResponse.data?.data) ? compartmentsResponse.data.data : 
                           Array.isArray(compartmentsResponse.data) ? compartmentsResponse.data : [];
        const transactions = Array.isArray(transactionsResponse.data?.data) ? transactionsResponse.data.data : 
                           Array.isArray(transactionsResponse.data) ? transactionsResponse.data : [];

        // Calculate stats
        const lowStockItems = items.filter(item => 
          item.maxQuantity > 0 && (item.currentQuantity / item.maxQuantity) * 100 < 20
        ).length;

        const recentTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return transactionDate >= weekAgo;
        }).length;

        // Compartment utilization data for chart
        const compartmentUtilization = compartments.map(comp => ({
          label: comp.name,
          value: comp.utilizationPercentage,
          color: comp.utilizationPercentage > 90 ? '#dc3545' : 
                 comp.utilizationPercentage > 70 ? '#ffc107' : '#28a745'
        }));

        // Stock levels distribution
        const stockLevels = [
          { 
            label: 'Low Stock', 
            value: items.filter(item => item.maxQuantity > 0 && (item.currentQuantity / item.maxQuantity) * 100 < 20).length,
            color: '#dc3545'
          },
          { 
            label: 'Medium Stock', 
            value: items.filter(item => {
              if (item.maxQuantity === 0) return false;
              const util = (item.currentQuantity / item.maxQuantity) * 100;
              return util >= 20 && util < 60;
            }).length,
            color: '#ffc107'
          },
          { 
            label: 'Good Stock', 
            value: items.filter(item => item.maxQuantity > 0 && (item.currentQuantity / item.maxQuantity) * 100 >= 60).length,
            color: '#28a745'
          }
        ];

        setDashboardData({
          totalItems: items.length,
          totalCompartments: compartments.length,
          lowStockItems,
          recentTransactions,
          compartmentUtilization,
          stockLevels,
          loading: false
        });
      } else {
        console.error('API responses failed:', { itemsResponse, compartmentsResponse, transactionsResponse });
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false,
        totalItems: 0,
        totalCompartments: 0,
        lowStockItems: 0,
        recentTransactions: 0,
        compartmentUtilization: [],
        stockLevels: []
      }));
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Warehouse Management Dashboard</h1>
        <p>Real-time overview of your warehouse operations</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <StatsCard
          title="Total Items"
          value={dashboardData.totalItems}
          subtitle="Items in inventory"
          icon="📦"
          color="primary"
        />
        
        <StatsCard
          title="Compartments"
          value={dashboardData.totalCompartments}
          subtitle="Storage compartments"
          icon="🏢"
          color="info"
        />
        
        <StatsCard
          title="Low Stock Alert"
          value={dashboardData.lowStockItems}
          subtitle="Items need restocking"
          icon="⚠️"
          color={dashboardData.lowStockItems > 0 ? "warning" : "success"}
        />
        
        <StatsCard
          title="Recent Activity"
          value={dashboardData.recentTransactions}
          subtitle="Transactions this week"
          icon="📊"
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <SimpleChart
          data={dashboardData.compartmentUtilization}
          type="bar"
          title="Compartment Utilization"
          height={250}
        />
        
        <SimpleChart
          data={dashboardData.stockLevels}
          type="donut"
          title="Stock Level Distribution"
          height={250}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="features-section">
        <div className="feature-card">
          <h3>🏢 Warehouse Overview</h3>
          <p>View all compartments and their contents</p>
          <Link to="/warehouse" className="feature-link">View Warehouse</Link>
        </div>
        
        <div className="feature-card">
          <h3>📦 Items Inventory</h3>
          <p>Browse and search all items</p>
          <Link to="/items" className="feature-link">View Items</Link>
        </div>
        
        <div className="feature-card">
          <h3>🔄 Send/Receive</h3>
          <p>Process inventory movements</p>
          <Link to="/send-receive" className="feature-link">Send/Receive</Link>
        </div>
        
        <div className="feature-card">
          <h3>📋 Transactions</h3>
          <p>Track all inventory changes</p>
          <Link to="/transactions" className="feature-link">View History</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
