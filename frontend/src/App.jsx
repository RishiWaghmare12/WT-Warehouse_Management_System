import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WarehousePage from './pages/WarehousePage';
import ItemsPage from './pages/ItemsPage';
import SendReceivePage from './pages/SendReceivePage';
import TransactionsPage from './pages/TransactionsPage';
import ToastContainer from './components/Toast/ToastContainer';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="app">
            <Navbar />
            <div className="content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/warehouse" element={<WarehousePage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/send-receive" element={<SendReceivePage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
              </Routes>
            </div>
            <ToastContainer />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
