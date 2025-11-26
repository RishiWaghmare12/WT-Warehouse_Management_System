import { useState } from 'react';
import ProgressBar from '../components/Charts/ProgressBar';
import ItemEditModal from '../components/Modals/ItemEditModal';
import ItemAddModal from '../components/Modals/ItemAddModal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { useItems } from '../hooks/useItems';
import { useCompartments } from '../hooks/useCompartments';
import { warehouseApi } from '../services/api';
import { calculateUtilization } from '../utils/calculations';
import { getStockStatusColor, isLowStock } from '../utils/statusHelpers';
import { RefreshCw } from 'lucide-react';
import '../App.css';

const ItemsPage = () => {
  const { items, loading, refetch: fetchItems } = useItems();
  const { compartments: categories } = useCompartments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { showSuccess, showError: showErrorToast } = useToast();

  // Client-side filtering - fast and efficient for warehouse data
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || item.categoryId == selectedCategory;
    
    const matchesLowStock = !showLowStock || isLowStock(item.currentQuantity, item.maxQuantity);
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = (updatedItem) => {
    // Refetch items to get updated data
    fetchItems();
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
    // Refetch items to get updated data
    fetchItems();
    showSuccess(`Item "${newItem.name}" created successfully`);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await warehouseApi.deleteItem(itemToDelete.id);
      if (response.success) {
        fetchItems();
        showSuccess(`Item "${itemToDelete.name}" deleted successfully`);
      } else {
        showErrorToast(response.error || 'Failed to delete item');
      }
    } catch {
      showErrorToast('Failed to delete item');
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
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
      ) : (
        <div className="items-grid-modern">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const utilizationPercentage = calculateUtilization(item.currentQuantity, item.maxQuantity);
              const statusColor = getStockStatusColor(utilizationPercentage);
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
                    <div className="utilization-badge" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
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
                    <div className="item-actions-buttons">
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
                      <button 
                        className="delete-item-icon-btn"
                        onClick={() => handleDeleteItem(item)}
                        title="Delete item"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
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

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default ItemsPage;