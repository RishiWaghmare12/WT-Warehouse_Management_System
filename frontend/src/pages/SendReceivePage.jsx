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
    <div className="send-receive-page-modern">
      <div className="page-header-modern">
        <div>
          <h1>Inventory Operations</h1>
          <p className="page-description">Send items out or receive items into the warehouse</p>
        </div>
        <div className="mode-toggle-modern">
          <button
            className={`mode-btn-modern ${mode === 'send' ? 'active' : ''}`}
            onClick={() => setMode('send')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            Send Items
          </button>
          <button
            className={`mode-btn-modern ${mode === 'receive' ? 'active' : ''}`}
            onClick={() => setMode('receive')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Receive Items
          </button>
        </div>
      </div>

      <div className="operations-layout-modern">
        <div className="items-section-modern">
          <div className="search-filters-modern">
            <div className="search-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={`Search items to ${mode}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter-modern"
            >
              <option value="">All Compartments</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="items-grid-modern">
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
                    className={`item-card-selectable-modern ${isSelected ? 'selected' : ''} ${mode === 'send' && item.currentQuantity === 0 ? 'disabled' : ''} ${mode === 'receive' && utilization === 100 ? 'disabled' : ''}`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="item-header-modern">
                      <h3 className="item-name-compact">{item.name}</h3>
                      <span className="item-category-badge-compact">{item.categoryName}</span>
                    </div>

                    <div className="item-quantity-compact">
                      <span className="current-quantity-compact">{item.currentQuantity}</span>
                      <span className="quantity-separator-compact">/</span>
                      <span className="max-quantity-compact">{item.maxQuantity}</span>
                    </div>

                    <ProgressBar
                      current={item.currentQuantity}
                      max={item.maxQuantity}
                      colorScheme="stock"
                      size="small"
                      showPercentage={false}
                    />

                    <div className="item-status-compact">
                      <span style={{ color: itemStatus.color, fontSize: '0.875rem', fontWeight: '500' }}>
                        {mode === 'send' ? `${item.currentQuantity} available` : `${item.maxQuantity - item.currentQuantity} space`}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="quantity-input-compact" onClick={(e) => e.stopPropagation()}>
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
              <div className="no-items-modern">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                </svg>
                <p>No items available for {mode === 'send' ? 'sending' : 'receiving'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-modern">
          <div className="selected-items-modern">
            <h3 className="sidebar-title">
              Selected Items
              <span className="count-badge">{selectedItems.length}</span>
            </h3>
            {selectedItems.length > 0 ? (
              <>
                <div className="selected-list-modern">
                  {selectedItems.map(selected => (
                    <div key={selected.item.id} className="selected-item-modern">
                      <div className="selected-item-info">
                        <span className="item-name-compact">{selected.item.name}</span>
                        <span className="item-quantity-compact">×{selected.quantity}</span>
                      </div>
                      <button
                        className="remove-btn-modern"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemSelect(selected.item);
                        }}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ display: 'block' }}
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="batch-action-btn-modern"
                  onClick={handleBatchOperation}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === 'send' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      )}
                      {mode === 'send' ? 'Send' : 'Receive'} All Items
                    </>
                  )}
                </button>
              </>
            ) : (
              <p className="no-selection-modern">Select items to {mode}</p>
            )}
          </div>

          <div className="recent-transactions-modern">
            <h3 className="sidebar-title">Recent Activity</h3>
            {recentTransactions.length > 0 ? (
              <div className="transaction-list-modern">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item-modern">
                    <span className={`transaction-type-modern ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'SEND' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      )}
                    </span>
                    <div className="transaction-details-modern">
                      <span className="transaction-item-name-compact">{transaction.itemName}</span>
                      <span className="transaction-quantity-compact">×{transaction.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-transactions-modern">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReceivePage;