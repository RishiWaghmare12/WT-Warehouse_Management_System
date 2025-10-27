import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import ProgressBar from '../components/Charts/ProgressBar';
import { warehouseApi } from '../services/api';
import '../App.css';

const SendReceivePage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState('send'); // 'send' or 'receive'
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchRecentTransactions();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory, mode]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await warehouseApi.getAllItems();

      if (response.success && response.data) {
        const itemsData = Array.isArray(response.data.data) ? response.data.data :
          Array.isArray(response.data) ? response.data : [];
        setItems(itemsData);
      } else {
        showError('Failed to fetch items');
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      showError('Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await warehouseApi.getCompartments();
      if (response.success) {
        const categoriesData = response.data.data || response.data;
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await warehouseApi.getAllTransactions();
      if (response.success) {
        const transactionsData = response.data.data || response.data;
        setRecentTransactions(transactionsData.slice(0, 5)); // Last 5 transactions
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const filterItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.categoryId == selectedCategory;

      // For send mode, only show items with stock
      // For receive mode, only show items with available space
      const matchesMode = mode === 'send' ?
        item.currentQuantity > 0 :
        item.currentQuantity < item.maxQuantity;

      return matchesSearch && matchesCategory && matchesMode;
    });

    setFilteredItems(filtered);
  };

  const handleItemSelect = (item) => {
    const isSelected = selectedItems.find(selected => selected.item.id === item.id);

    if (isSelected) {
      setSelectedItems(prev => prev.filter(selected => selected.item.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, { item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity) || 1);
    setSelectedItems(prev =>
      prev.map(selected =>
        selected.item.id === itemId
          ? { ...selected, quantity: numQuantity }
          : selected
      )
    );
  };

  const validateOperation = () => {
    if (selectedItems.length === 0) {
      showWarning('Please select at least one item');
      return false;
    }

    for (const selected of selectedItems) {
      if (mode === 'send' && selected.quantity > selected.item.currentQuantity) {
        showError(`Cannot send ${selected.quantity} units of ${selected.item.name}. Only ${selected.item.currentQuantity} available.`);
        return false;
      }

      if (mode === 'receive') {
        const availableSpace = selected.item.maxQuantity - selected.item.currentQuantity;
        if (selected.quantity > availableSpace) {
          showError(`Cannot receive ${selected.quantity} units of ${selected.item.name}. Only ${availableSpace} space available.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleBatchOperation = async () => {
    if (!validateOperation()) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const selected of selectedItems) {
        try {
          const response = mode === 'send'
            ? await warehouseApi.sendItems({
              itemId: selected.item.id,
              quantity: selected.quantity
            })
            : await warehouseApi.receiveExistingItem({
              itemId: selected.item.id,
              quantity: selected.quantity
            });

          if (response.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(`Successfully ${mode === 'send' ? 'sent' : 'received'} ${successCount} item(s)`);
        setSelectedItems([]);
        fetchItems();
        fetchRecentTransactions();
      }

      if (failCount > 0) {
        showError(`Failed to process ${failCount} item(s)`);
      }

    } catch (error) {
      showError(`Failed to ${mode} items`);
    } finally {
      setLoading(false);
    }
  };

  const getItemStatus = (item) => {
    const utilization = (item.currentQuantity / item.maxQuantity) * 100;
    if (utilization === 0) return { status: 'empty', color: '#dc3545' };
    if (utilization < 20) return { status: 'low', color: '#dc3545' };
    if (utilization < 60) return { status: 'medium', color: '#ffc107' };
    if (utilization === 100) return { status: 'full', color: '#6c757d' };
    return { status: 'good', color: '#28a745' };
  };

  return (
    <div className="send-receive-page-new">
      <div className="page-header">
        <h1>Inventory Operations</h1>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'send' ? 'active' : ''}`}
            onClick={() => setMode('send')}
          >
            📤 Send Items
          </button>
          <button
            className={`mode-btn ${mode === 'receive' ? 'active' : ''}`}
            onClick={() => setMode('receive')}
          >
            📥 Receive Items
          </button>
        </div>

      </div>

      <div className="operations-layout">
        <div className="items-section">
          <div className="search-filters">
            <input
              type="text"
              placeholder={`Search items to ${mode}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="">All Compartments</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="items-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading items...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => {
                const isSelected = selectedItems.find(selected => selected.item.id === item.id);
                const itemStatus = getItemStatus(item);
                const utilization = (item.currentQuantity / item.maxQuantity) * 100;

                return (
                  <div
                    key={item.id}
                    className={`item-card-selectable ${isSelected ? 'selected' : ''} ${mode === 'send' && item.currentQuantity === 0 ? 'disabled' : ''} ${mode === 'receive' && utilization === 100 ? 'disabled' : ''}`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <span className="item-category-badge">{item.categoryName}</span>
                    </div>

                    <div className="item-quantity">
                      <span className="current-quantity">{item.currentQuantity}</span>
                      <span className="quantity-separator"> / </span>
                      <span className="max-quantity">{item.maxQuantity}</span>
                    </div>

                    <ProgressBar
                      current={item.currentQuantity}
                      max={item.maxQuantity}
                      colorScheme="stock"
                      size="small"
                      showPercentage={false}
                    />

                    <div className="item-status">
                      <span style={{ color: itemStatus.color }}>
                        {mode === 'send' ? `${item.currentQuantity} available` : `${item.maxQuantity - item.currentQuantity} space`}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="quantity-input" onClick={(e) => e.stopPropagation()}>
                        <label>Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max={mode === 'send' ? item.currentQuantity : item.maxQuantity - item.currentQuantity}
                          value={isSelected.quantity}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-items">
                No items available for {mode === 'send' ? 'sending' : 'receiving'}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="selected-items">
            <h3>Selected Items ({selectedItems.length})</h3>
            {selectedItems.length > 0 ? (
              <>
                <div className="selected-list">
                  {selectedItems.map(selected => (
                    <div key={selected.item.id} className="selected-item">
                      <span className="item-name">{selected.item.name}</span>
                      <span className="item-quantity">×{selected.quantity}</span>
                      <button
                        className="remove-btn"
                        onClick={() => handleItemSelect(selected.item)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="batch-action-btn"
                  onClick={handleBatchOperation}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `${mode === 'send' ? 'Send' : 'Receive'} All Items`}
                </button>
              </>
            ) : (
              <p className="no-selection">Select items to {mode}</p>
            )}
          </div>

          <div className="recent-transactions">
            <h3>Recent Activity</h3>
            {recentTransactions.length > 0 ? (
              <div className="transaction-list">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'SEND' ? '📤' : '📥'}
                    </span>
                    <div className="transaction-details">
                      <span className="transaction-item-name">{transaction.itemName}</span>
                      <span className="transaction-quantity">×{transaction.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-transactions">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReceivePage;