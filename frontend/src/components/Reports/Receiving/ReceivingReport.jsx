import React, { useState } from 'react';
import SpaceReport from './SpaceReport';

const ReceivingReport = () => {
  const [itemsToReceive, setItemsToReceive] = useState({
    itemType: '',
    quantity: 0
  });
  const [report, setReport] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call will be integrated here
    // For now, using mock data
    const mockReport = {
      hasSpace: false,
      item: itemsToReceive.itemType,
      compartments: ['A1', 'B2'],
      surplus: 5,
      remainingSpace: {
        'A1': 10,
        'B2': 15
      }
    };
    setReport(mockReport);
  };

  return (
    <div className="receiving-report">
      <h2>Receiving Report</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Item Type:</label>
          <input
            type="text"
            value={itemsToReceive.itemType}
            onChange={(e) => setItemsToReceive(prev => ({
              ...prev,
              itemType: e.target.value
            }))}
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={itemsToReceive.quantity}
            onChange={(e) => setItemsToReceive(prev => ({
              ...prev,
              quantity: parseInt(e.target.value)
            }))}
          />
        </div>
        <button type="submit">Generate Report</button>
      </form>
      
      {report && <SpaceReport report={report} />}
    </div>
  );
};

export default ReceivingReport;
