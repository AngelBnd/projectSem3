import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="bg-[#F5F7FA] px-[180px] pt-[52px]">
      {children}
    </div>
  );
};

export default ProtectedRoute;