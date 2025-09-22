import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Sidebar from './components/Sidebar';
import Inventory from './components/pages/Inventory';
import Sales from './components/pages/Sales';
import InputSales from './components/pages/InputSales';
import InputInventory from './components/pages/InputInventory';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const setAuthenticated = (authStatus) => {
    setIsAuthenticated(authStatus);
  };

  return (
    <div className="grid grid-cols-12 min-h-screen w-screen bg-gray-100">
      {isAuthenticated && <Sidebar />}

      <main className="col-span-10 bg-[#F5F7FA] px-[180px] pt-[52px]">
        <Routes>
          <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/inventory"
            element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />}
          />
          <Route
            path="/sales"
            element={isAuthenticated ? <Sales /> : <Navigate to="/login" />}
          />
          <Route
            path="/sales/input"
            element={isAuthenticated ? <InputSales /> : <Navigate to="/login" />}
          />
          <Route
            path="/inventory/input"
            element={isAuthenticated ? <InputInventory /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/inventory" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;