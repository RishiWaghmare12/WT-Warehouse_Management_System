import React from 'react';
import CompartmentList from '../components/Warehouse/CompartmentList';

const WarehousePage = () => {
  return (
    <div className="warehouse-page">
      <h1>Warehouse Overview</h1>
      <CompartmentList />
    </div>
  );
};

export default WarehousePage;
