import React, { useState } from 'react';

const CompartmentList = ({ compartments }) => {
  const [expandedCompartment, setExpandedCompartment] = useState(null);

  const handleCompartmentClick = (compartment) => {
    setExpandedCompartment(compartment);
  };

  const handleClose = () => {
    setExpandedCompartment(null);
  };

  return (
    <div className="compartments-grid">
      {compartments.map((compartment) => (
        <div
          key={compartment.id}
          className={`compartment ${expandedCompartment?.id === compartment.id ? 'expanded' : ''}`}
          onClick={() => handleCompartmentClick(compartment)}
        >
          {expandedCompartment?.id === compartment.id && (
            <button className="close-button" onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            {compartment.name}
          </h3>
          // ... rest of the existing code ...
        </div>
      ))}
    </div>
  );
};

export default CompartmentList; 