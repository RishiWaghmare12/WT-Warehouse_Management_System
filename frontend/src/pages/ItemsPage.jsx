import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../services/api';
import '../App.css';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await warehouseApi.getAllItems();

      if (response.success && response.data) {
        const itemsData = response.data.data || response.data;
        if (Array.isArray(itemsData)) {
          setItems(itemsData);
          setError('');
        } else {
          setItems([]);
          setError('Invalid data format received');
        }
      } else {
        setError('Failed to fetch items');
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await warehouseApi.getCompartments();
      if (response.success && response.data) {
        const categoriesData = response.data.data || response.data;
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage < 20) return '#dc3545'; // Red for low stock
    if (percentage < 50) return '#ffc107'; // Yellow for medium stock
    return '#28a745'; // Green for good stock
  };

  // Client-side filtering - fast and efficient for warehouse data
  const filteredItems = items.filter(item => {
    const utilizationPercentage = (item.currentQuantity / item.maxQuantity) * 100;
    
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || item.categoryId == selectedCategory;
    
    const matchesLowStock = !showLowStock || utilizationPercentage < 20;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="items-page">
      <div className="items-header">
        <h2>Items Inventory</h2>
        <button className="refresh-button" onClick={fetchItems}>
          🔄 Refresh
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="items-search-section">
        <input
          type="text"
          className="items-search-input"
          placeholder="Search items by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="items-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Low Stock Items:</label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              Show only items with less than 20% stock
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : error ? (
        <div className="error-report">
          <h3>Error Loading Items</h3>
          <p>{error}</p>
          <button onClick={fetchItems}>Try Again</button>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const utilizationPercentage = Math.round((item.currentQuantity / item.maxQuantity) * 100);
              return (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="item-category-badge">{item.categoryName}</span>
                  </div>
                  
                  <div className="item-quantity">
                    <span className="current-quantity">{item.currentQuantity}</span>
                    <span className="quantity-separator"> / </span>
                    <span className="max-quantity">{item.maxQuantity}</span>
                  </div>
                  
                  <div className="utilization-bar">
                    <div 
                      className="utilization-fill"
                      style={{
                        width: `${utilizationPercentage}%`,
                        backgroundColor: getUtilizationColor(utilizationPercentage)
                      }}
                    ></div>
                  </div>
                  
                  <div className="item-stats">
                    <span className="utilization-text">
                      {utilizationPercentage}% utilized
                    </span>
                    <span className="available-space">
                      {item.availableSpace} available
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-items">No items found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemsPage;