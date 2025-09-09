import React from 'react';
import CompartmentList from '../components/Warehouse/CompartmentList';

const WarehousePage = () => {
  // Mock data - will be replaced with API call
  const mockCompartments = [
    {
      id: 'A1',
      itemType: 'Small Items',
      capacity: 100,
      currentItems: 75,
      size: 'small'
    },
    {
      id: 'A2',
      itemType: 'Medium Items',
      capacity: 50,
      currentItems: 30,
      size: 'medium'
    },
    {
      id: 'B1',
      itemType: 'Large Items',
      capacity: 25,
      currentItems: 20,
      size: 'large'
    }
  ];

  return (
    <div className="warehouse-page">
      <h1>Warehouse Overview</h1>
      <CompartmentList compartments={mockCompartments} />
    </div>
  );
};

export default WarehousePage;
