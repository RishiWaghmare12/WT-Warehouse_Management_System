import React, { useState, useEffect } from 'react';
import ProgressBar from '../components/Charts/ProgressBar';
import ItemEditModal from '../components/Modals/ItemEditModal';
import ItemAddModal from '../components/Modals/ItemAddModal';
import { useToast } from '../context/ToastContext';
import { warehouseApi } from '../services/api';
import { RefreshCw } from 'lucide-react';
import '../App.css';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

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

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = (updatedItem) => {
    // Update the items list with the edited item
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    showSuccess(`Item "${updatedItem.name}" updated successfully`);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleAddItem = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveNewItem = (newItem) => {
    // Add the new item to the list
    setItems(prev => [...prev, newItem]);
    showSuccess(`Item "${newItem.name}" created successfully`);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="items-page-modern">
      <div className="items-page-header">
        <div>
          <h1>Items Inventory</h1>
          <p className="page-description">Browse and manage all warehouse items</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="add-item-button-modern" onClick={handleAddItem} title="Add new item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
          <button className="refresh-button-modern" onClick={fetchItems} title="Refresh items">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="items-search-section-modern">
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="items-search-input-modern"
            placeholder="Search items by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="items-filters-compact">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select-modern"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <label className="checkbox-label-modern">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            <span>Low Stock Only</span>
          </label>
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
        <div className="items-grid-modern">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const utilizationPercentage = Math.round((item.currentQuantity / item.maxQuantity) * 100);
              const getStatusColor = () => {
                if (utilizationPercentage < 20) return '#ef4444';
                if (utilizationPercentage < 50) return '#f59e0b';
                return '#22c55e';
              };
              return (
                <div key={item.id} className="item-card-modern">
                  <div className="item-card-header">
                    <h3 className="item-name-modern">{item.name}</h3>
                    <span className="item-category-badge-modern">{item.categoryName}</span>
                  </div>
                  
                  <div className="item-quantity-modern">
                    <div className="quantity-display">
                      <span className="current-quantity-modern">{item.currentQuantity}</span>
                      <span className="quantity-separator-modern">/</span>
                      <span className="max-quantity-modern">{item.maxQuantity}</span>
                    </div>
                    <div className="utilization-badge" style={{ backgroundColor: `${getStatusColor()}15`, color: getStatusColor() }}>
                      {utilizationPercentage}%
                    </div>
                  </div>
                  
                  <ProgressBar
                    current={item.currentQuantity}
                    max={item.maxQuantity}
                    colorScheme="stock"
                    size="medium"
                    showPercentage={false}
                  />
                  
                  <div className="item-stats-modern">
                    <span className="available-space-modern">
                      {item.availableSpace} available
                    </span>
                    <button 
                      className="edit-item-icon-btn"
                      onClick={() => handleEditItem(item)}
                      title="Edit item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-items-modern">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p>No items found</p>
            </div>
          )}
        </div>
      )}

      <ItemEditModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
      />

      <ItemAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleSaveNewItem}
      />
    </div>
  );
};

export default ItemsPage;