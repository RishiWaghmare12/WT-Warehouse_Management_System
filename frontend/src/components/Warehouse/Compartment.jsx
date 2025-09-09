import React, { useState } from 'react';

const Compartment = ({ id, name, capacity, currentItems, items = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const occupancyPercentage = (currentItems / capacity) * 100;

  return (
    <div className={`compartment ${isExpanded ? 'expanded' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
      {isExpanded && (
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
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
        <div className="occupancy-bar">
          <div 
            className={`occupancy-fill ${occupancyPercentage > 90 ? 'danger' : occupancyPercentage > 70 ? 'warning' : ''}`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>
      
      {isExpanded && items.length > 0 && (
        <div className="items-list">
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
                  <div className="occupancy-bar">
                    <div 
                      className={`occupancy-fill ${itemOccupancy > 90 ? 'danger' : itemOccupancy > 70 ? 'warning' : ''}`}
                      style={{ width: `${itemOccupancy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {isExpanded && items.length === 0 && (
        <div className="no-items">No items in this compartment</div>
      )}
    </div>
  );
};

export default Compartment;
