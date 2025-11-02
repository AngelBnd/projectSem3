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
  import Products from "./components/pages/ProductsPage";
  import BreadcrumbsMUI from "./components/BreadcrumbsMUI";
  import AvatarSettings from "./components/AvatarSettings";

  const SettingsIcon = ()=>(
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
  )

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
          className="flex-1 min-w-0 overflow-y-auto  bg-white border-l bg-[#F5F7FA] md:ml-60"
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
            <div className="absolute inset-0 grid grid-cols-9 gap-[12px] pointer-events-none z-0 px-[60px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-red-500/10 w-full h-full"></div>
              ))}
            </div>

            {/* Actual content */}
            <div className="relative grid grid-cols-9 gap-[12px] z-10 px-[60px]">
              {/* He  ader */}
              <div className="col-span-9 pt-8 h-[60px] flex justify-between items-center mb-2">
                <BreadcrumbsMUI />
                <AvatarSettings />
              </div>

              <div className="col-span-9 grid ">
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
                    path="/products"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Products />
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