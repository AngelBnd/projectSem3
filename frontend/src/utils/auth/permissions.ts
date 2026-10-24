import { getCurrentUser } from './token';


export const getUserPermissions = () => {
  const user = getCurrentUser();
  return user?.permissions || [];
};

export const hasPermission = (module: string, action: string) => {
  const permissions = getUserPermissions();
  return permissions.includes(`${module}:${action}`);
};

export const hasAnyPermission = (permissionList: string[]) => {
  const permissions = getUserPermissions();
  return permissionList.some((permission: string) => permissions.includes(permission));
};

export const hasAllPermissions = (permissionList: string[]) => {
  const permissions = getUserPermissions();
  return permissionList.every((permission: string) => permissions.includes(permission));
};

export const getUserRoles = () => {
  const user = getCurrentUser();
  return user?.roleNames || [];
};

export const getPrimaryRole = () => {
  const user = getCurrentUser();
  return user?.primaryRole || '';
};


export const hasRole = (roleName: string) => {
  const roles = getUserRoles();
  return roles.includes(roleName);
};


export const hasAnyRole = (roleList: string[]) => {
  const roles = getUserRoles();
  return roleList.some((role: string) => roles.includes(role));
};
