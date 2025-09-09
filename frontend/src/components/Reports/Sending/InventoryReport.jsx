import React from 'react';

const InventoryReport = ({ report }) => {
  const { hasStock, item, availableItems, difference, compartmentInventory } = report;

  return (
    <div className="inventory-report">
      <h3>Inventory Status Report</h3>
      {!hasStock ? (
        <div className="error-report">
          <h4>Not Enough Items Available</h4>
          <p>Item: {item}</p>
          <p>Available Items: {availableItems}</p>
          <p>Shortage: {difference} items</p>
        </div>
      ) : (
        <div className="success-report">
          <h4>Items Available for Sending</h4>
          <p>Item: {item}</p>
          <h5>Current Inventory by Compartment:</h5>
          <ul>
            {Object.entries(compartmentInventory).map(([compartment, count]) => (
              <li key={compartment}>
                Compartment {compartment}: {count} items
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InventoryReport;
