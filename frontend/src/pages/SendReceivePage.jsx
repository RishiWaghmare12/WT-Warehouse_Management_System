import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../services/api';

const SendReceivePage = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await warehouseApi.getAllItems();
      console.log('Items response:', response);
      
      if (response.success && response.data) {
        // Handle different response formats
        if (Array.isArray(response.data)) {
          setItems(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setItems(response.data.data);
        } else {
          console.error('Unexpected items format:', response.data);
          setItems([]);
          setError('Failed to load items: Invalid data format');
        }
      } else {
        console.error('Error fetching items:', response.error);
        setError('Failed to fetch items');
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items');
      setItems([]);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setQuantity('');
    setError('');
    setSuccess('');
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSend = async () => {
    if (!selectedItem || !quantity) {
      setError('Please select an item and specify quantity');
      return;
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (numQuantity > selectedItem.currentQuantity) {
      setError(`Cannot send more than available quantity (${selectedItem.currentQuantity})`);
      return;
    }

    try {
      const response = await warehouseApi.sendItems({
        itemId: selectedItem.id,
        quantity: numQuantity
      });

      if (response.success) {
        setSuccess(`Successfully sent ${numQuantity} units of ${selectedItem.name}`);
        setSelectedItem(null);
        setQuantity('');
        fetchItems();
      } else {
        setError(response.error || 'Failed to send items');
      }
    } catch (err) {
      console.error('Error sending items:', err);
      setError('Failed to send items');
    }
  };

  const handleReceive = async () => {
    if (!selectedItem || !quantity) {
      setError('Please select an item and specify quantity');
      return;
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    const availableSpace = selectedItem.maxQuantity - selectedItem.currentQuantity;
    if (numQuantity > availableSpace) {
      setError(`Cannot receive more than available space (${availableSpace})`);
      return;
    }

    try {
      const response = await warehouseApi.receiveExistingItem({
        itemId: selectedItem.id,
        quantity: numQuantity
      });

      if (response.success) {
        setSuccess(`Successfully received ${numQuantity} units of ${selectedItem.name}`);
        setSelectedItem(null);
        setQuantity('');
        fetchItems();
      } else {
        setError(response.error || 'Failed to receive items');
      }
    } catch (err) {
      console.error('Error receiving items:', err);
      setError('Failed to receive items');
    }
  };

  return (
    <div className="send-receive-page">
      <h2>Send/Receive Items</h2>
      
      <div className="item-selection">
        <h3>Select Item</h3>
        <select 
          value={selectedItem?.id || ''} 
          onChange={(e) => {
            const itemId = parseInt(e.target.value);
            const item = items.find(item => item.id === itemId);
            handleItemSelect(item);
          }}
        >
          <option value="">Select an item...</option>
          {Array.isArray(items) && items.length > 0 ? (
            items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.currentQuantity}/{item.maxQuantity})
              </option>
            ))
          ) : (
            <option disabled>No items available</option>
          )}
        </select>
      </div>

      {selectedItem && (
        <div className="item-details">
          <h3>Item Details</h3>
          <p>Name: {selectedItem.name}</p>
          <p>Compartment: {selectedItem.compartmentName}</p>
          <p>Current Status: {selectedItem.currentQuantity}/{selectedItem.maxQuantity}</p>
          <p>Available Space: {selectedItem.maxQuantity - selectedItem.currentQuantity}</p>
        </div>
      )}

      <div className="quantity-input">
        <h3>Enter Quantity</h3>
        <input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          placeholder="Enter quantity"
          min="1"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="action-buttons">
        <button onClick={handleSend} className="send-button">Send Items</button>
        <button onClick={handleReceive} className="receive-button">Receive Items</button>
      </div>
    </div>
  );
};

export default SendReceivePage;