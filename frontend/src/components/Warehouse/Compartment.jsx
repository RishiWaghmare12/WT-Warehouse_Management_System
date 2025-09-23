import React from 'react';
import ProgressBar from '../Charts/ProgressBar';

const Compartment = ({ id, name, capacity, currentItems, items = [], isExpanded, onToggleExpanded }) => {
  const occupancyPercentage = (currentItems / capacity) * 100;

  return (
    <div className={`compartment ${isExpanded ? 'expanded' : ''}`} onClick={() => onToggleExpanded(id)}>
      {isExpanded && (
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          onToggleExpanded(id);
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      <h3>{name} (Compartment {id})</h3>
      <div className="compartment-info">
        <p>Total Capacity: {capacity}</p>
        <p>Space Used: {currentItems}</p>
        <p>Available Space: {capacity - currentItems}</p>
        <ProgressBar
          current={currentItems}
          max={capacity}
          label={`Utilization: ${occupancyPercentage.toFixed(1)}%`}
          colorScheme="capacity"
          size="medium"
        />
      </div>

      {isExpanded && items.length > 0 && (
        <div className="items-list" onClick={(e) => e.stopPropagation()}>
          <h4>Items in Compartment:</h4>
          <div className="items-grid">
            {items.map(item => {
              const itemOccupancy = (item.current_quantity / item.max_quantity) * 100;
              return (
                <div key={item.item_id} className="item-card">
                  <h5>{item.name}</h5>
                  <p>ID: {item.item_id}</p>
                  <p>Current Quantity: {item.current_quantity}</p>
                  <p>Maximum Capacity: {item.max_quantity}</p>
                  <ProgressBar
                    current={item.current_quantity}
                    max={item.max_quantity}
                    colorScheme="stock"
                    size="small"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isExpanded && items.length === 0 && (
        <div className="no-items" onClick={(e) => e.stopPropagation()}>No items in this compartment</div>
      )}
    </div>
  );
};

export default Compartment;
