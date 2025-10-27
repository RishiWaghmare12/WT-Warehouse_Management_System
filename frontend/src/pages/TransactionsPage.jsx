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
  const [menuOpen, setMenuOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.menu-dropdown')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
    <div className="transactions-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-main">
          <div className="header-info">
            <h1 className="page-title">Transaction History</h1>
            <p className="page-subtitle">View and manage all warehouse transactions</p>
          </div>
          <div className="header-actions">
            <div className="menu-dropdown">
              <button className="btn btn-outline" onClick={() => setMenuOpen(!menuOpen)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
                Actions
              </button>

              {menuOpen && (
                <div className="menu-dropdown-content">
                  <button className="menu-item" onClick={handleRefresh}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                    </svg>
                    Refresh Data
                  </button>
                  <button className="menu-item" onClick={handleDownload}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export CSV
                  </button>
                  <button className="menu-item" onClick={handlePrint}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 6,2 18,2 18,9" />
                      <path d="M6,18H4a2,2 0 0,1-2-2V11a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
                      <polyline points="6,14 18,14 18,22 6,22 6,14" />
                    </svg>
                    Print Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-header">
          <h3 className="filters-title">Filters</h3>
          {(searchTerm || typeFilter || dateFrom || dateTo) && (
            <button
              className="clear-all-btn"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-field">
            <label className="field-label">Search</label>
            <div className="input-group">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by item name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="filter-field">
            <label className="field-label">Transaction Type</label>
            <div className="select-wrapper">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                <option value="SEND">Send</option>
                <option value="RECEIVE">Receive</option>
              </select>
            </div>
          </div>

          <div className="filter-field">
            <label className="field-label">Date Range</label>
            <div className="date-group">
              <div className="date-input-wrapper">
                <svg className="date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-input date-input"
                />
              </div>
              <span className="date-divider">to</span>
              <div className="date-input-wrapper">
                <svg className="date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-input date-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <div className="summary-stats">
          <span className="total-count">
            {filteredTransactions.length} of {transactions.length} transactions
          </span>
          {filteredTransactions.length !== transactions.length && (
            <span className="filtered-indicator">(filtered)</span>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th className="type-column">Type</th>
                  <th className="item-column">Item Details</th>
                  <th className="quantity-column">Quantity</th>
                  <th className="date-column">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id || index} className="transaction-row">
                    <td className="type-cell">
                      <span className={`type-badge ${transaction.type?.toLowerCase() || 'unknown'}`}>
                        {transaction.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="item-cell">
                      <div className="item-info">
                        <div className="item-name">{transaction.itemName || 'N/A'}</div>
                        <div className="item-id">ID: {transaction.itemId || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="quantity-cell">
                      <span className="quantity-value">{transaction.quantity || 0}</span>
                    </td>
                    <td className="date-cell">
                      <div className="date-info">
                        <div className="date-primary">
                          {formatDate(transaction.createdAt || transaction.date || new Date())}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : transactions.length > 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h3>No matching transactions</h3>
            <p>Try adjusting your search criteria or clear the filters to see all transactions.</p>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
              </svg>
            </div>
            <h3>No transactions found</h3>
            <p>There are no transactions in the system yet. Start by adding some items to the warehouse.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
