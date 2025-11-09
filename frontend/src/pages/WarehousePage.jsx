import React from 'react';
import CompartmentList from '../components/Warehouse/CompartmentList';

const WarehousePage = () => {
  return (
    <div className="warehouse-page-modern">
      <div className="warehouse-page-header">
        <div>
          <h1>Warehouse Overview</h1>
          <p className="page-description">Monitor all compartments and their inventory status</p>
        </div>
      </div>
      <CompartmentList />
    </div>
  );
};

export default WarehousePage;
