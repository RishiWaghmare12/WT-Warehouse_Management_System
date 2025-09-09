import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../../services/api';

const WarehouseReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await warehouseApi.getWarehouseReport();
      if (response.success) {
        setReport(response.data);
      } else {
        setError('Failed to fetch warehouse report');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading report...</div>;
  if (error) return <div className="error-report">{error}</div>;
  if (!report) return null;

  return (
    <div className="warehouse-report">
      <h2>Warehouse Report</h2>
      {report.map((compartment) => (
        <div key={compartment.category_id} className="report-section">
          <h3>Compartment {compartment.category_id}: {compartment.name}</h3>
          <div className="report-details">
            <p>Capacity: {compartment.max_capacity}</p>
            <p>Space Used: {compartment.current_capacity}</p>
            <p>Available Space: {compartment.max_capacity - compartment.current_capacity}</p>
          </div>
          {compartment.items.length > 0 ? (
            <div className="items-list">
              <h4>Items:</h4>
              <ul>
                {compartment.items.map((item) => (
                  <li key={item.item_id}>
                    <span>{item.name}</span>
                    <span>ID: {item.item_id}</span>
                    <span>Quantity: {item.current_quantity}</span>
                    <span>Max: {item.max_quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="no-items">No items in this compartment</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default WarehouseReport;
