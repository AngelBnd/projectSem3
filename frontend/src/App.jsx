import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Sidebar from './components/Sidebar';
import ProtectedRoute from '../src/components/pages/ProtectedRoute'; 
import Inventory from './components/pages/Inventory';
import Sales from './components/pages/Sales';
import InputSales from './components/pages/InputSales';
import InputInventory from './components/pages/InputInventory';
import { PopupProvider, usePopup } from './components/PopupContext';
import Dashboard from './components/pages/Dashboard';
import PendingList from './components/pages/PendingList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const setAuthenticated = (authStatus) => {
    setIsAuthenticated(authStatus);
  };

  const showSidebar = isAuthenticated && !['/login', '/register'].includes(location.pathname);
  const mainColSpan = showSidebar ? 'col-span-10' : 'col-span-12';

  return (
    <div className="grid grid-cols-12 min-h-screen w-screen bg-gray-100">
      {showSidebar && <Sidebar />}

      {/* Remove the px/pt classes from the main tag */}
      <main className={`${mainColSpan} bg-[#F5F7FA] h-screen overflow-y-auto`}>
        <PopupProvider>
          <Routes>
            <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
            <Route path="/register" element={<Register />} />

            {/* Use the ProtectedRoute component to wrap authenticated pages */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/PendingList"
              element={<ProtectedRoute isAuthenticated={isAuthenticated}><PendingList /></ProtectedRoute>}
            />
            <Route
              path="/inventory"
              element={<ProtectedRoute isAuthenticated={isAuthenticated}><Inventory /></ProtectedRoute>}
            />
            <Route
              path="/sales"
              element={<ProtectedRoute isAuthenticated={isAuthenticated}><Sales /></ProtectedRoute>}
            />
            <Route
              path="/sales/input"
              element={<ProtectedRoute isAuthenticated={isAuthenticated}><InputSales /></ProtectedRoute>}
            />
            <Route
              path="/inventory/input"
              element={<ProtectedRoute isAuthenticated={isAuthenticated}><InputInventory /></ProtectedRoute>}
            />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </PopupProvider>
      </main>
    </div>
  );
}

export default App;