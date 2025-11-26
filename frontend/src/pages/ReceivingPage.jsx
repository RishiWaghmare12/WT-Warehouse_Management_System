import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { warehouseApi } from '../services/api';
import { formatDateShort } from '../utils/calculations';
import '../App.css';

const ReceivingPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isNewItem, setIsNewItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchRecentTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      const response = await warehouseApi.getAllItems();
      if (response.success && response.data) {
        const itemsData = Array.isArray(response.data.data) ? response.data.data :
          Array.isArray(response.data) ? response.data : [];
        // Only show items with available space for receiving
        setItems(itemsData.filter(item => item.currentQuantity < item.maxQuantity));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showError('Failed to fetch items');
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
        // Filter for receive transactions only
        const receiveTransactions = transactionsData.filter(t => t.type === 'RECEIVE');
        setRecentTransactions(receiveTransactions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleReceive = async (e) => {
    e.preventDefault();

    if (isNewItem) {
      if (!newItemName || !selectedCategory || !quantity) {
        showError('Please fill in all fields for new item');
        return;
      }
    } else {
      if (!selectedItem || !quantity) {
        showError('Please select an item and enter quantity');
        return;
      }
    }

    const receiveQuantity = parseInt(quantity);

    if (!isNewItem) {
      const item = items.find(i => i.id == selectedItem);
      if (!item) {
        showError('Selected item not found');
        return;
      }

      const availableSpace = item.maxQuantity - item.currentQuantity;
      if (receiveQuantity > availableSpace) {
        showError(`Cannot receive ${receiveQuantity} units. Only ${availableSpace} space available.`);
        return;
      }
    }

    setLoading(true);
    try {
      let response;

      if (isNewItem) {
        response = await warehouseApi.receiveItems({
          category_id: selectedCategory,
          name: newItemName,
          quantity: receiveQuantity
        });
      } else {
        response = await warehouseApi.receiveExistingItem({
          itemId: selectedItem,
          quantity: receiveQuantity
        });
      }

      if (response.success) {
        const itemName = isNewItem ? newItemName : items.find(i => i.id == selectedItem)?.name;
        showSuccess(`Successfully received ${receiveQuantity} units of ${itemName}`);

        // Reset form
        setSelectedItem('');
        setNewItemName('');
        setSelectedCategory('');
        setQuantity('');
        setIsNewItem(false);

        fetchItems();
        fetchRecentTransactions();
      } else {
        showError(response.error || 'Failed to receive items');
      }
    } catch {
      showError('Failed to receive items');
    } finally {
      setLoading(false);
    }
  };

  const selectedItemData = items.find(i => i.id == selectedItem);

  return (
    <div className="receiving-page">
      <div className="page-header">
        <h1>📥 Receive Items</h1>
        <p>Add items to warehouse inventory</p>
      </div>

      <div className="operations-layout">
        <div className="receive-form-section">
          <form onSubmit={handleReceive} className="operations-form">
            <h3>Receive Items</h3>

            <div className="operation-buttons">
              <button
                type="button"
                className={`operation-btn ${!isNewItem ? 'active' : ''}`}
                onClick={() => setIsNewItem(false)}
              >
                Existing Item
              </button>
              <button
                type="button"
                className={`operation-btn ${isNewItem ? 'active' : ''}`}
                onClick={() => setIsNewItem(true)}
              >
                New Item
              </button>
            </div>

            {isNewItem ? (
              <>
                <div className="form-group">
                  <label htmlFor="category">Compartment:</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">Choose a compartment...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="newItemName">Item Name:</label>
                  <input
                    type="text"
                    id="newItemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                    placeholder="Enter item name"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="item">Select Item:</label>
                  <select
                    id="item"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">Choose an item...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.maxQuantity - item.currentQuantity} space available
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItemData && (
                  <div className="item-info">
                    <p><strong>Category:</strong> {selectedItemData.categoryName}</p>
                    <p><strong>Current Stock:</strong> {selectedItemData.currentQuantity} units</p>
                    <p><strong>Available Space:</strong> {selectedItemData.maxQuantity - selectedItemData.currentQuantity} units</p>
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label htmlFor="quantity">Quantity to Receive:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selectedItemData && !isNewItem ? selectedItemData.maxQuantity - selectedItemData.currentQuantity : undefined}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Receiving...' : 'Receive Items'}
              </button>
            </div>
          </form>
        </div>

        <div className="sidebar">
          <div className="recent-transactions">
            <h3>Recent Receiving Activity</h3>
            {recentTransactions.length > 0 ? (
              <div className="transaction-list">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <span className="transaction-type">📥</span>
                    <div className="transaction-details">
                      <span className="transaction-item-name">{transaction.itemName}</span>
                      <span className="transaction-quantity">×{transaction.quantity}</span>
                      <span className="transaction-date">
                        {formatDateShort(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-transactions">No recent receiving activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceivingPage;
