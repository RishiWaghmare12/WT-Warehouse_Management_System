import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { warehouseApi } from '../services/api';
import { Calendar } from 'lucide-react';
import { formatDate } from '../utils/calculations';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handlePrint = () => {
    const dataToPrint = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const hasFilters = filteredTransactions.length > 0 && filteredTransactions.length !== transactions.length;

    // Calculate statistics
    const totalTransactions = dataToPrint.length;
    const sendTransactions = dataToPrint.filter(t => t.type === 'SEND').length;
    const receiveTransactions = dataToPrint.filter(t => t.type === 'RECEIVE').length;
    const totalSendQuantity = dataToPrint
      .filter(t => t.type === 'SEND')
      .reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
    const totalReceiveQuantity = dataToPrint
      .filter(t => t.type === 'RECEIVE')
      .reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
    const netQuantity = totalReceiveQuantity - totalSendQuantity;

    // Get date range
    const dates = dataToPrint.map(t => new Date(t.createdAt || t.date || new Date())).sort((a, b) => a - b);
    const dateRange = dates.length > 0
      ? `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`
      : 'N/A';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction History Report</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 1.5cm;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              line-height: 1.6;
              background: #ffffff;
            }
            
            .report-container {
              max-width: 100%;
              background: white;
            }
            
            .report-header {
              border-bottom: 4px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
              position: relative;
            }
            
            .header-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 15px;
            }
            
            .logo-section {
              flex: 1;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: 700;
              color: #2563eb;
              margin-bottom: 5px;
              letter-spacing: -0.5px;
            }
            
            .company-tagline {
              font-size: 14px;
              color: #64748b;
              font-weight: 400;
            }
            
            .report-meta {
              text-align: right;
              font-size: 12px;
              color: #64748b;
            }
            
            .report-title {
              font-size: 32px;
              font-weight: 700;
              color: #0f172a;
              margin: 20px 0 10px 0;
              text-align: center;
            }
            
            .report-subtitle {
              text-align: center;
              color: #64748b;
              font-size: 14px;
              margin-bottom: 10px;
            }
            
            .filter-info {
              text-align: center;
              background: #f1f5f9;
              padding: 8px 15px;
              border-radius: 6px;
              font-size: 12px;
              color: #475569;
              margin-top: 10px;
              display: inline-block;
            }
            
            .summary-section {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 30px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }
            
            .summary-card {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .summary-card.send {
              border-left-color: #dc3545;
            }
            
            .summary-card.receive {
              border-left-color: #22c55e;
            }
            
            .summary-card.net {
              border-left-color: #f59e0b;
            }
            
            .summary-label {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            
            .summary-value {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 5px;
            }
            
            .summary-subvalue {
              font-size: 14px;
              color: #64748b;
            }
            
            .table-section {
              margin-top: 30px;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              background: white;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            thead {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
            }
            
            th {
              padding: 14px 12px;
              text-align: left;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: none;
            }
            
            tbody tr {
              border-bottom: 1px solid #e2e8f0;
              transition: background 0.2s;
            }
            
            tbody tr:hover {
              background: #f8fafc;
            }
            
            tbody tr:nth-child(even) {
              background: #fafbfc;
            }
            
            tbody tr:nth-child(even):hover {
              background: #f1f5f9;
            }
            
            td {
              padding: 12px;
              font-size: 13px;
              color: #334155;
            }
            
            .type-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .type-badge.send {
              background: #fee2e2;
              color: #dc2626;
            }
            
            .type-badge.receive {
              background: #dcfce7;
              color: #16a34a;
            }
            
            .quantity-cell {
              font-weight: 600;
              color: #0f172a;
            }
            
            .date-cell {
              color: #64748b;
              font-size: 12px;
            }
            
            .report-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
            
            .footer-info {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              .summary-section {
                break-inside: avoid;
              }
              
              table {
                break-inside: auto;
              }
              
              thead {
                display: table-header-group;
              }
              
              tbody tr {
                break-inside: avoid;
                break-after: auto;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="report-header">
              <div class="header-top">
                <div class="logo-section">
                  <div class="company-name">Warehouse Management System</div>
                  <div class="company-tagline">Transaction History Report</div>
                </div>
                <div class="report-meta">
                  <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                  <div><strong>Report ID:</strong> TRX-${Date.now().toString().slice(-6)}</div>
                </div>
              </div>
              <h1 class="report-title">Transaction History</h1>
              <p class="report-subtitle">${hasFilters ? `Filtered Results (${totalTransactions} of ${transactions.length} transactions)` : `Complete Transaction Report (${totalTransactions} transactions)`}</p>
              ${hasFilters ? `<div style="text-align: center; margin-top: 10px;"><span class="filter-info">⚠️ Report contains filtered data</span></div>` : ''}
            </div>
            
            <!-- Summary Section -->
            <div class="summary-section">
              <div class="summary-card">
                <div class="summary-label">Total Transactions</div>
                <div class="summary-value">${totalTransactions}</div>
                <div class="summary-subvalue">${dateRange}</div>
              </div>
              <div class="summary-card send">
                <div class="summary-label">Sent Items</div>
                <div class="summary-value">${sendTransactions}</div>
                <div class="summary-subvalue">Qty: ${totalSendQuantity.toLocaleString()}</div>
              </div>
              <div class="summary-card receive">
                <div class="summary-label">Received Items</div>
                <div class="summary-value">${receiveTransactions}</div>
                <div class="summary-subvalue">Qty: ${totalReceiveQuantity.toLocaleString()}</div>
              </div>
              <div class="summary-card net">
                <div class="summary-label">Net Quantity</div>
                <div class="summary-value" style="color: ${netQuantity >= 0 ? '#22c55e' : '#dc3545'}">${netQuantity >= 0 ? '+' : ''}${netQuantity.toLocaleString()}</div>
                <div class="summary-subvalue">${netQuantity >= 0 ? 'Positive' : 'Negative'} balance</div>
              </div>
            </div>
            
            <!-- Transactions Table -->
            <div class="table-section">
              <h2 class="section-title">Transaction Details</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 10%;">#</th>
                    <th style="width: 15%;">Item ID</th>
                    <th style="width: 25%;">Item Name</th>
                    <th style="width: 12%;">Type</th>
                    <th style="width: 12%;">Quantity</th>
                    <th style="width: 26%;">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToPrint.map((transaction, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td><strong>${transaction.itemId || 'N/A'}</strong></td>
                      <td>${transaction.itemName || 'N/A'}</td>
                      <td>
                        <span class="type-badge ${(transaction.type || '').toLowerCase()}">
                          ${transaction.type || 'Unknown'}
                        </span>
                      </td>
                      <td class="quantity-cell">${transaction.quantity || 0}</td>
                      <td class="date-cell">${formatDate(transaction.createdAt || transaction.date || new Date())}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <!-- Footer -->
            <div class="report-footer">
              <div style="margin-bottom: 10px;">
                <strong>Warehouse Management System</strong> | Transaction History Report
              </div>
              <div class="footer-info">
                <div>Page 1 of 1</div>
                <div>Confidential - For Internal Use Only</div>
                <div>${new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownload = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const csvContent = [
      ['Item ID', 'Item Name', 'Type', 'Quantity', 'Date'],
      ...dataToExport.map(transaction => [
        transaction.itemId,
        transaction.itemName,
        transaction.type,
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
    <div className="transactions-container-modern">
      {/* Header Section */}
      <div className="page-header-modern">
        <div className="header-main-modern">
          <div className="header-info-modern">
            <h1 className="page-title-modern">Transaction History</h1>
            <p className="page-description">View and manage all warehouse transactions</p>
          </div>
          <div className="header-actions-modern">
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
              <svg viewBox="0 0 24 24" fill="none">
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
            <div className="date-range-container">
              <div className="date-range-input-wrapper">
                <Calendar className="date-range-icon" size={16} strokeWidth={2.5} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="date-range-input"
                />
              </div>
              <div className="date-range-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="date-range-input-wrapper">
                <Calendar className="date-range-icon" size={16} strokeWidth={2.5} />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="date-range-input"
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
                  <th className="id-column">Item ID</th>
                  <th className="item-column">Item Name</th>
                  <th className="type-column">Type</th>
                  <th className="quantity-column">Quantity</th>
                  <th className="date-column">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id || index} className="transaction-row">
                    <td className="id-cell">
                      <span className="item-id">{transaction.itemId || 'N/A'}</span>
                    </td>
                    <td className="item-cell">
                      <span className="item-name">{transaction.itemName || 'N/A'}</span>
                    </td>
                    <td className="type-cell">
                      <span className={`type-badge ${transaction.type?.toLowerCase() || 'unknown'}`}>
                        {transaction.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="quantity-cell">
                      <span className="quantity-value">{transaction.quantity || 0}</span>
                    </td>
                    <td className="date-cell">
                      <span className="date-primary">
                        {formatDate(transaction.createdAt || transaction.date || new Date())}
                      </span>
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
