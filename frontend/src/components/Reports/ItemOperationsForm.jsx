import React, { useState } from 'react';
import { warehouseApi } from '../../services/api';

const ItemOperationsForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    quantity: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      const response = await warehouseApi.receiveItems(payload);

      if (response.success) {
        setFormData({
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

      <div className="form-group">
        <label htmlFor="category_id">Compartment ID:</label>
        <input
          type="number"
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        />
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
      
      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Receive Items'}
        </button>
      </div>
    </form>
  );
};

export default ItemOperationsForm;
