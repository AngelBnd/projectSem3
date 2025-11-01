// App.jsx (Tailwind layout version)
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import SidebarMUI from "./components/SidebarMUI";
import Dashboard from "./components/pages/Dashboard";
import Inventory from "./components/pages/Inventory";
import Sales from "./components/pages/Sales";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import ProtectedRoute from "./components/pages/ProtectedRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const showSidebar =
    isAuthenticated && !["/login", "/register"].includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 !w-screen">
      {showSidebar && (
        <aside
          className={`hidden md:block w-60 bg-white border-r border-gray-200 flex-shrink-0`}
        >
          <SidebarMUI 
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          />
        </aside>
      )}

      <main
        className={`flex-1 min-w-0 overflow-y-auto bg-white border-l border-gray-300`} 
      >
        {showSidebar && (
          <div className="md:hidden p-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 border rounded-md hover:bg-gray-100"
            >
              ☰
            </button>
          </div>
        )}

  
        <div className="relative min-h-screen flex-1 min-w-0">
          {/* Transparent red overlay to visualize columns */}
          <div className="absolute inset-0 grid grid-cols-9 gap-[12px] pointer-events-none z-0 px-[60px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-red-500/10 "
              ></div>
            ))}
          </div>

          {/* Actual content */}
          <div className="relative grid grid-cols-9 gap-[12px] z-10 px-[60px]">
            <div className="col-span-9 ">
              <Routes>
                <Route
                  path="/login"
                  element={<Login setAuthenticated={setIsAuthenticated} />}
                />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Inventory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Sales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={isAuthenticated ? "/dashboard" : "/login"}
                      replace
                    />
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;