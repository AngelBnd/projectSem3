import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  return (
    <div>
      {children}
    </div>
  );
};

export default ProtectedRoute;