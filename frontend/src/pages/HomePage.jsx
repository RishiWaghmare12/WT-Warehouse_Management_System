import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/Dashboard/StatsCard';
import SimpleChart from '../components/Charts/SimpleChart';
import { useItems } from '../hooks/useItems';
import { useCompartments } from '../hooks/useCompartments';
import { useTransactions } from '../hooks/useTransactions';
import { isLowStock, STATUS_COLORS, THRESHOLDS, getCapacityStatusColor } from '../utils/statusHelpers';
import { calculateUtilization } from '../utils/calculations';
import '../components/Dashboard/Dashboard.css';

const HomePage = () => {
  const { items, loading: itemsLoading } = useItems();
  const { compartments, loading: compartmentsLoading } = useCompartments();
  const { transactions, loading: transactionsLoading } = useTransactions();
  
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    totalCompartments: 0,
    lowStockItems: 0,
    recentTransactions: 0,
    compartmentUtilization: [],
    stockLevels: [],
  });

  const loading = itemsLoading || compartmentsLoading || transactionsLoading;

  useEffect(() => {
    if (!loading && items.length >= 0 && compartments.length >= 0 && transactions.length >= 0) {
      // Calculate stats
      const lowStockItems = items.filter(item => 
        item.maxQuantity > 0 && isLowStock(item.currentQuantity, item.maxQuantity)
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
        color: getCapacityStatusColor(comp.utilizationPercentage)
      }));

      // Stock levels distribution
      const stockLevels = [
        { 
          label: 'Low Stock', 
          value: items.filter(item => {
            if (item.maxQuantity === 0) return false;
            const util = calculateUtilization(item.currentQuantity, item.maxQuantity);
            return util < THRESHOLDS.LOW_STOCK;
          }).length,
          color: STATUS_COLORS.LOW
        },
        { 
          label: 'Medium Stock', 
          value: items.filter(item => {
            if (item.maxQuantity === 0) return false;
            const util = calculateUtilization(item.currentQuantity, item.maxQuantity);
            return util >= THRESHOLDS.LOW_STOCK && util < THRESHOLDS.MEDIUM_STOCK;
          }).length,
          color: STATUS_COLORS.MEDIUM
        },
        { 
          label: 'Good Stock', 
          value: items.filter(item => {
            if (item.maxQuantity === 0) return false;
            const util = calculateUtilization(item.currentQuantity, item.maxQuantity);
            return util >= THRESHOLDS.MEDIUM_STOCK;
          }).length,
          color: STATUS_COLORS.GOOD
        }
      ];

      setDashboardData({
        totalItems: items.length,
        totalCompartments: compartments.length,
        lowStockItems,
        recentTransactions,
        compartmentUtilization,
        stockLevels,
      });
    }
  }, [items, compartments, transactions, loading]);

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
