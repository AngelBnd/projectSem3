export const getCurrentUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const getUserId = () => {
  const user = getCurrentUser();
  return user?.userId || null;
};

export const getStoreId = () => {
  const user = getCurrentUser();
  return user?.storeId || null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getTokenExpiration = () => {
  const user = getCurrentUser();
  return user?.exp || null;
};

export const getUserPermissions = () => {
  const user = getCurrentUser();
  return user?.permissions || [];
};

export const getUserRoles = () => {
  const user = getCurrentUser();
  return user?.roleNames || [];
};

export const getPrimaryRole = () => {
  const user = getCurrentUser();
  return user?.primaryRole || '';
};