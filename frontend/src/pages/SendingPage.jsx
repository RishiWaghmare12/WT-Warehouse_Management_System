import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { warehouseApi } from '../services/api';
import { formatDateShort } from '../utils/calculations';
import '../App.css';

const SendingPage = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchItems();
    fetchRecentTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      const response = await warehouseApi.getAllItems();
      if (response.success && response.data) {
        const itemsData = Array.isArray(response.data.data) ? response.data.data :
          Array.isArray(response.data) ? response.data : [];
        // Only show items with stock for sending
        setItems(itemsData.filter(item => item.currentQuantity > 0));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showError('Failed to fetch items');
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await warehouseApi.getAllTransactions();
      if (response.success) {
        const transactionsData = response.data.data || response.data;
        // Filter for send transactions only
        const sendTransactions = transactionsData.filter(t => t.type === 'SEND');
        setRecentTransactions(sendTransactions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity) {
      showError('Please select an item and enter quantity');
      return;
    }

    const item = items.find(i => i.id == selectedItem);
    if (!item) {
      showError('Selected item not found');
      return;
    }

    const sendQuantity = parseInt(quantity);
    if (sendQuantity > item.currentQuantity) {
      showError(`Cannot send ${sendQuantity} units. Only ${item.currentQuantity} available.`);
      return;
    }

    setLoading(true);
    try {
      const response = await warehouseApi.sendItems({
        itemId: selectedItem,
        quantity: sendQuantity
      });

      if (response.success) {
        showSuccess(`Successfully sent ${sendQuantity} units of ${item.name}`);
        setSelectedItem('');
        setQuantity('');
        fetchItems();
        fetchRecentTransactions();
      } else {
        showError(response.error || 'Failed to send items');
      }
    } catch {
      showError('Failed to send items');
    } finally {
      setLoading(false);
    }
  };

  const selectedItemData = items.find(i => i.id == selectedItem);

  return (
    <div className="sending-page">
      <div className="page-header">
        <h1>📤 Send Items</h1>
        <p>Send items from warehouse inventory</p>
      </div>

      <div className="operations-layout">
        <div className="send-form-section">
          <form onSubmit={handleSend} className="operations-form">
            <h3>Send Items</h3>

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
                    {item.name} - {item.currentQuantity} available
                  </option>
                ))}
              </select>
            </div>

            {selectedItemData && (
              <div className="item-info">
                <p><strong>Category:</strong> {selectedItemData.categoryName}</p>
                <p><strong>Available:</strong> {selectedItemData.currentQuantity} units</p>
                <p><strong>Max Capacity:</strong> {selectedItemData.maxQuantity} units</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="quantity">Quantity to Send:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selectedItemData ? selectedItemData.currentQuantity : 1}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Items'}
              </button>
            </div>
          </form>
        </div>

        <div className="sidebar">
          <div className="recent-transactions">
            <h3>Recent Sending Activity</h3>
            {recentTransactions.length > 0 ? (
              <div className="transaction-list">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <span className="transaction-type">📤</span>
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
              <p className="no-transactions">No recent sending activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendingPage;
