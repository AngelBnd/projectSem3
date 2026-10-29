// App.jsx (Tailwind layout version)
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import SidebarMUI from "./components/globalComponents/SidebarMUI";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import BreadcrumbsMUI from "../src/components/globalComponents/BreadcrumbsMUI";
import AvatarSettings from "../src/components/globalComponents/AvatarSettings";
import {
  Dashboard,
  Inventory,
  SalesPage,
  Login,
  Products,
  InputSales,
  SalesDetails,
  CreateProduct,
  Register,
  Users,
  CreateOrderSale,
  AccessStatus,
  AuditLogs,
  InventoryMovement,
  Suppliers,
  PurchaseOrders,
} from "./pages";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const hideSidebar =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/access-status");
  const showSidebar = isAuthenticated && !hideSidebar;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex min-h-screen w-screen !overflow-x-hidden ">
        {showSidebar && (
          <aside
            className={`hidden md:block w-60 bg-white border-r border-gray-200 fixed top-0 left-0 h-screen z-20`}
          >
            <SidebarMUI
              mobileOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
            />
          </aside>
        )}

        <main
          className={`flex-1 min-w-0 overflow-y-auto  bg-white border-l bg-[#F5F7FA] 
             ${showSidebar ? "md:ml-60" : "md:ml-0"}`}
        >
          {showSidebar && (
            <div className="md:hidden p-2 !bg-transparent">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 border rounded-md hover:bg-gray-100 !bg-transparent text-black"
              >
                ☰
              </button>
            </div>
          )}

          <div className="relative min-h-screen flex-1 bg-[#F3F4F7] !overflow-x-hidden min-w-0 ">
            {/* Transparent red overlay to visualize columns */}
            <div
              className={`absolute inset-0 pointer-events-none z-0 ${
                showSidebar
                  ? "grid grid-cols-9 gap-[12px] px-[60px]"
                  : "grid grid-cols-12 gap-3 px-[60px]"
              }`}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="500/10 w-full h-full"></div>
              ))}
            </div>

            {/* Actual content */}
            <div
              className={`relative z-10 ${
                showSidebar
                  ? "grid grid-cols-9 gap-[12px] px-[60px]"
                  : "grid grid-cols-12 gap-3 px-[60px]"
              }`}
            >
              {showSidebar && (
                <div className="col-span-9 pt-8 h-[60px] flex justify-between items-center mb-2">
                  <BreadcrumbsMUI />
                  <AvatarSettings />
                </div>
              )}

              <div
                className={`grid ${
                  showSidebar ? "col-span-9" : "col-span-12 "
                }`}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route
                    path="/login"
                    element={<Login setAuthenticated={setIsAuthenticated} />}
                  />
                  <Route path="/register" element={<Register />} />
                  <Route path="/access-status" element={<AccessStatus />} />
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
                        <SalesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/create-order-sales"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <CreateOrderSale />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/edit/:id"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <CreateOrderSale />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/details"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <SalesDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Products />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/create-product"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <CreateProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/auditLogs"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <AuditLogs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/invMovement"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <InventoryMovement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/suppliers"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Suppliers />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/purchase-orders"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <PurchaseOrders />
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
    </ThemeProvider>
  );
}

export default App;
