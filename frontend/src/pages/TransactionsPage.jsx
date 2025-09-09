import React, { useState, useEffect } from 'react';
import { warehouseApi } from '../services/api';
import '../App.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await warehouseApi.getAllTransactions();
      
      if (response.success && response.data) {
        // Handle different response formats
        if (Array.isArray(response.data)) {
          const sortedTransactions = response.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setTransactions(sortedTransactions);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          const sortedTransactions = response.data.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setTransactions(sortedTransactions);
        } else {
          console.error('Unexpected response format:', response.data);
          setTransactions([]);
          setError('Failed to load transactions: Invalid data format');
        }
      } else {
        console.error('Error fetching transactions:', response.error);
        setError('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2>Transaction History</h2>
        <button className="refresh-button" onClick={handleRefresh}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
          </svg>
          Refresh Data
        </button>
      </div>
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="error-report">
          <h3>Error Loading Transactions</h3>
          <p>{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <div 
                key={transaction.id} 
                className={`transaction-card ${transaction.type ? transaction.type.toLowerCase() : ''}`}
              >
                <div className="transaction-header">
                  <h3>{transaction.type}</h3>
                  <span className="transaction-date">{formatDate(transaction.createdAt || new Date())}</span>
                </div>
                
                <div className="transaction-details">
                  <p><strong>Item:</strong> {transaction.itemName}</p>
                  <p><strong>Item ID:</strong> {transaction.itemId}</p>
                  <p><strong>Quantity:</strong> {transaction.quantity}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-transactions">No transactions found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
