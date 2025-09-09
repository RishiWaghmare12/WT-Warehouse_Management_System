import React, { useState } from 'react';
import InventoryReport from './InventoryReport';

const SendingReport = () => {
  const [itemsToSend, setItemsToSend] = useState({
    itemType: '',
    quantity: 0
  });
  const [report, setReport] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call will be integrated here
    // For now, using mock data
    const mockReport = {
      hasStock: false,
      item: itemsToSend.itemType,
      availableItems: 15,
      difference: 5,
      compartmentInventory: {
        'A1': 8,
        'B2': 7
      }
    };
    setReport(mockReport);
  };

  return (
    <div className="sending-report">
      <h2>Sending Report</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Item Type:</label>
          <input
            type="text"
            value={itemsToSend.itemType}
            onChange={(e) => setItemsToSend(prev => ({
              ...prev,
              itemType: e.target.value
            }))}
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={itemsToSend.quantity}
            onChange={(e) => setItemsToSend(prev => ({
              ...prev,
              quantity: parseInt(e.target.value)
            }))}
          />
        </div>
        <button type="submit">Generate Report</button>
      </form>
      
      {report && <InventoryReport report={report} />}
    </div>
  );
};

export default SendingReport;
