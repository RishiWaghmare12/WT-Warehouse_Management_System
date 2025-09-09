import React from 'react';
import ItemOperationsForm from '../components/Reports/ItemOperationsForm';
import WarehouseReport from '../components/Reports/WarehouseReport';

const SendingPage = () => {
  const handleOperationSuccess = () => {
    // You can add any additional logic here after successful operation
  };

  return (
    <div className="sending-page">
      <h1>Sending Management</h1>
      <ItemOperationsForm onSuccess={handleOperationSuccess} />
      <WarehouseReport />
    </div>
  );
};

export default SendingPage;
