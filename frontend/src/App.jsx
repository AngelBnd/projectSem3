// App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, IconButton, SvgIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import SidebarMUI, { drawerWidth } from './components/SidebarMUI';
import ProtectedRoute from './components/pages/ProtectedRoute';
import Dashboard from './components/pages/Dashboard';
import Inventory from './components/pages/Inventory';
import Sales from './components/pages/Sales';
import InputSales from './components/pages/InputSales';
import InputInventory from './components/pages/InputInventory';
import PendingList from './components/pages/PendingList';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import { PopupProvider, usePopup } from './components/PopupContext';

const GlobalPopupRenderer = () => {
  const { isPopupOpen, popupContent } = usePopup();
  if (!isPopupOpen) return null;
  return popupContent.content;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const showSidebar = isAuthenticated && !['/login', '/register'].includes(location.pathname);

  const CustomMenuIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </SvgIcon>
  );

  return (
    <PopupProvider>
      <CssBaseline />
      <GlobalPopupRenderer />

      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F7FA' }}>

        {showSidebar && (
          <SidebarMUI
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            isMobile={isMobile}
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            boxSizing: 'border-box',
            overflowY: 'auto',
            border: '1px dashed red',
            backgroundColor: '#fff',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
    
          {showSidebar && isMobile && (
            <Box sx={{ mb: 2 }}>
              <IconButton onClick={handleDrawerToggle} size="large">
                <CustomMenuIcon />
              </IconButton>
            </Box>
          )}

          <Routes>
            <Route path="/login" element={<Login setAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Inventory /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Sales /></ProtectedRoute>} />
            <Route path="/sales/input" element={<ProtectedRoute isAuthenticated={isAuthenticated}><InputSales /></ProtectedRoute>} />
            <Route path="/inventory/input" element={<ProtectedRoute isAuthenticated={isAuthenticated}><InputInventory /></ProtectedRoute>} />
            <Route path="/pendinglist" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PendingList /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </Box>
      </Box>
    </PopupProvider>
  );
}

export default App;
