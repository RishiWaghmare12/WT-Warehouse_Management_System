import React from 'react';
import ItemOperationsForm from '../components/Reports/ItemOperationsForm';
import WarehouseReport from '../components/Reports/WarehouseReport';

const ReceivingPage = () => {
  const handleOperationSuccess = () => {
    // You can add any additional logic here after successful operation
  };

  return (
    <div className="receiving-page">
      <ItemOperationsForm onSuccess={handleOperationSuccess} />
      <WarehouseReport />
    </div>
  );
};

export default ReceivingPage;
