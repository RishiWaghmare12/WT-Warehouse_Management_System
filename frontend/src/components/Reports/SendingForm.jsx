import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../../services/api';

const SendingForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: '',
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await warehouseApi.getAllItems();
      if (response.success) {
        setItems(response.data);
      } else {
        setError('Failed to fetch items');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await warehouseApi.sendItems(formData);
      if (response.success) {
        setSuccess('Items sent successfully!');
        setFormData({
          item_id: '',
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
      <h3>Send Items</h3>
      
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
              {item.name} (ID: {item.id}) - Available: {item.current_quantity}
            </option>
          ))}
        </select>
      </div>

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
          {loading ? 'Processing...' : 'Send Items'}
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

export default SendingForm;
