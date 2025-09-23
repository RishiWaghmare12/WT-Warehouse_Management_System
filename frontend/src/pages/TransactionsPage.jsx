import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { warehouseApi } from '../services/api';
import '../App.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, typeFilter, dateFrom, dateTo]);

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
          showError('Failed to load transactions: Invalid data format');
        }
      } else {
        console.error('Error fetching transactions:', response.error);
        showError('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showError('Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === '' || transaction.type === typeFilter;
      
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const transactionDate = new Date(transaction.date || transaction.createdAt);
        if (dateFrom) {
          matchesDateRange = matchesDateRange && transactionDate >= new Date(dateFrom);
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && transactionDate <= toDate;
        }
      }
      
      return matchesSearch && matchesType && matchesDateRange;
    });

    setFilteredTransactions(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Transaction History Report</h1>
        <p style="text-align: center; margin-bottom: 30px; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
        ${transactions.map(transaction => `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: ${transaction.type === 'SEND' ? '#fff5f5' : '#f0fdf4'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
              <h3 style="margin: 0; color: ${transaction.type === 'SEND' ? '#dc3545' : '#28a745'};">${transaction.type}</h3>
              <span style="color: #666; font-size: 14px;">${formatDate(transaction.createdAt || new Date())}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
              <p style="margin: 0;"><strong>Item:</strong> ${transaction.itemName}</p>
              <p style="margin: 0;"><strong>Item ID:</strong> ${transaction.itemId}</p>
              <p style="margin: 0;"><strong>Quantity:</strong> ${transaction.quantity}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction History Report</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const csvContent = [
      ['Type', 'Item Name', 'Item ID', 'Quantity', 'Date'],
      ...dataToExport.map(transaction => [
        transaction.type,
        transaction.itemName,
        transaction.itemId,
        transaction.quantity,
        formatDate(transaction.createdAt || transaction.date || new Date())
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(`Exported ${dataToExport.length} transactions`);
  };

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2>Transaction History</h2>
        <div className="header-actions">
          <button className="print-button" onClick={handlePrint}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6,9 6,2 18,2 18,9" />
              <path d="M6,18H4a2,2 0 0,1-2-2V11a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
              <polyline points="6,14 18,14 18,22 6,22 6,14" />
            </svg>
            Print
          </button>
          <button className="download-button" onClick={handleDownload}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CSV
          </button>
          <button className="refresh-button" onClick={handleRefresh}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="transactions-filters">
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="type-filter"
        >
          <option value="">All Types</option>
          <option value="SEND">Send</option>
          <option value="RECEIVE">Receive</option>
        </select>
        
        <div className="date-range-filter">
          <label>From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="date-filter"
          />
          <label>To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="date-filter"
          />
        </div>
        
        {(searchTerm || typeFilter || dateFrom || dateTo) && (
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setDateFrom('');
              setDateTo('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.length > 0 ? (
            <>
              <div className="transactions-summary">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
              {filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={`transaction-card ${transaction.type ? transaction.type.toLowerCase() : ''}`}
                >
                  <div className="transaction-header">
                    <h3>{transaction.type}</h3>
                    <span className="transaction-date">{formatDate(transaction.createdAt || transaction.date || new Date())}</span>
                  </div>

                  <div className="transaction-details">
                    <p><strong>Item:</strong> {transaction.itemName}</p>
                    <p><strong>Item ID:</strong> {transaction.itemId}</p>
                    <p><strong>Quantity:</strong> {transaction.quantity}</p>
                  </div>
                </div>
              ))}
            </>
          ) : transactions.length > 0 ? (
            <div className="no-transactions">No transactions match your filters</div>
          ) : (
            <div className="no-transactions">No transactions found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
