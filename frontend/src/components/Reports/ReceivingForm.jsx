import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../../services/api';

const ReceivingForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    mode: 'new', // 'new' or 'existing'
    category_id: '',
    name: '',
    item_id: '',
    quantity: '',
  });
  const [items, setItems] = useState([]);
  const [compartments, setCompartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchCompartments();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await warehouseApi.getAllItems();
      if (response.success) {
        setItems(response.data);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const fetchCompartments = async () => {
    try {
      const response = await warehouseApi.getCompartments();
      if (response.success) {
        setCompartments(response.data);
      }
    } catch (err) {
      console.error('Error fetching compartments:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModeChange = (mode) => {
    setFormData(prev => ({
      ...prev,
      mode,
      // Reset fields when changing modes
      item_id: '',
      category_id: mode === 'new' ? prev.category_id : '',
      name: mode === 'new' ? prev.name : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      let response;
      
      if (formData.mode === 'existing') {
        response = await warehouseApi.receiveExistingItem({
          item_id: formData.item_id,
          quantity: formData.quantity
        });
      } else {
        response = await warehouseApi.receiveItems({
          category_id: formData.category_id,
          name: formData.name,
          quantity: formData.quantity
        });
      }

      if (response.success) {
        setSuccess('Items received successfully!');
        setFormData({
          ...formData,
          item_id: '',
          category_id: '',
          name: '',
          quantity: '',
        });
        if (onSuccess) onSuccess();
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="operations-form">
      <h3>Receive Items</h3>
      
      <div className="form-row">
        <div className="form-group operation-buttons">
          <button
            type="button"
            className={`operation-btn ${formData.mode === 'new' ? 'active' : ''}`}
            onClick={() => handleModeChange('new')}
          >
            New Item
          </button>
          <button
            type="button"
            className={`operation-btn ${formData.mode === 'existing' ? 'active' : ''}`}
            onClick={() => handleModeChange('existing')}
          >
            Existing Item
          </button>
        </div>
      </div>

      {formData.mode === 'new' ? (
        <>
          <div className="form-group">
            <label htmlFor="category_id">Compartment:</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select a Compartment --</option>
              {compartments.map(compartment => (
                <option key={compartment.id} value={compartment.id}>
                  {compartment.name} (ID: {compartment.id}) - Available: {compartment.available_space}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="name">Item Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </>
      ) : (
        <div className="form-group">
          <label htmlFor="item_id">Select Item:</label>
          <select
            id="item_id"
            name="item_id"
            value={formData.item_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select an Item --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} (ID: {item.id}) - Max Capacity: {item.max_capacity}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      {error && <div className="error-report">{error}</div>}
      {success && <div className="success-report">{success}</div>}
      
      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Receive Items'}
        </button>
        <button 
          type="button" 
          className="transaction-btn" 
          onClick={() => window.location.href = '/transactions'}
        >
          View Transactions
        </button>
      </div>
    </form>
  );
};

export default ReceivingForm;
