import React from 'react';

const SpaceReport = ({ report }) => {
  const { hasSpace, item, compartments, surplus, remainingSpace } = report;

  return (
    <div className="space-report">
      <h3>Space Availability Report</h3>
      {!hasSpace ? (
        <div className="error-report">
          <h4>Not Enough Space Available</h4>
          <p>Item: {item}</p>
          <p>Affected Compartments: {compartments.join(', ')}</p>
          <p>Surplus Items: {surplus}</p>
        </div>
      ) : (
        <div className="success-report">
          <h4>Space Available</h4>
          <p>Item: {item}</p>
          <h5>Remaining Space in Compartments:</h5>
          <ul>
            {Object.entries(remainingSpace).map(([compartment, space]) => (
              <li key={compartment}>
                Compartment {compartment}: {space} units
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpaceReport;
