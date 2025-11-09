import { getCurrentUser } from './token';


export const getUserPermissions = () => {
  const user = getCurrentUser();
  return user?.permissions || [];
};


export const hasPermission = (module, action) => {
  const permissions = getUserPermissions();
  return permissions.includes(`${module}:${action}`);
};

export const hasAnyPermission = (permissionList) => {
  const permissions = getUserPermissions();
  return permissionList.some(permission => permissions.includes(permission));
};

export const hasAllPermissions = (permissionList) => {
  const permissions = getUserPermissions();
  return permissionList.every(permission => permissions.includes(permission));
};

export const getUserRoles = () => {
  const user = getCurrentUser();
  return user?.roleNames || [];
};

export const getPrimaryRole = () => {
  const user = getCurrentUser();
  return user?.primaryRole || '';
};


export const hasRole = (roleName) => {
  const roles = getUserRoles();
  return roles.includes(roleName);
};


export const hasAnyRole = (roleList) => {
  const roles = getUserRoles();
  return roleList.some(role => roles.includes(role));
};
