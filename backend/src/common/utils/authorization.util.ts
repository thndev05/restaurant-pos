import { RoleName } from 'src/generated/prisma';

/**
 * User type with role and permissions for authorization checks
 */
export interface AuthUser {
  id: string;
  username: string;
  name: string;
  isActive: boolean;
  role: {
    name: RoleName;
    displayName: string;
    permissions: {
      permission: {
        name: string;
        resource: string;
        action: string;
      };
    }[];
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser, role: RoleName): boolean {
  return user.role.name === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser, roles: RoleName[]): boolean {
  return roles.includes(user.role.name);
}

/**
 * Check if user has all specified roles (usually just one role per user)
 */
export function hasAllRoles(user: AuthUser, roles: RoleName[]): boolean {
  return roles.every((role) => user.role.name === role);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: AuthUser,
  permissions: string[],
): boolean {
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(
  user: AuthUser,
  permissions: string[],
): boolean {
  const userPermissions = getUserPermissions(user);
  return permissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Get all permission names for a user
 */
export function getUserPermissions(user: AuthUser): string[] {
  return user.role?.permissions?.map((rp) => rp.permission.name) || [];
}

/**
 * Check if user can perform an action on a resource
 */
export function canPerformAction(
  user: AuthUser,
  resource: string,
  action: string,
): boolean {
  const userPermissions = user.role?.permissions || [];
  return userPermissions.some(
    (rp) =>
      rp.permission.resource === resource && rp.permission.action === action,
  );
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role.name === RoleName.ADMIN;
}

/**
 * Check if user is manager or above (admin, manager)
 */
export function isManagerOrAbove(user: AuthUser): boolean {
  const managerRoles: RoleName[] = [RoleName.ADMIN, RoleName.MANAGER];
  return managerRoles.includes(user.role.name);
}

/**
 * Get user role display name
 */
export function getUserRoleDisplayName(user: AuthUser): string {
  return user.role.displayName;
}

/**
 * Filter permissions by resource
 */
export function getPermissionsByResource(
  user: AuthUser,
  resource: string,
): string[] {
  return (
    user.role?.permissions
      ?.filter((rp) => rp.permission.resource === resource)
      .map((rp) => rp.permission.action) || []
  );
}

/**
 * Check if user can read a resource
 */
export function canRead(user: AuthUser, resource: string): boolean {
  return canPerformAction(user, resource, 'read');
}

/**
 * Check if user can create a resource
 */
export function canCreate(user: AuthUser, resource: string): boolean {
  return canPerformAction(user, resource, 'create');
}

/**
 * Check if user can update a resource
 */
export function canUpdate(user: AuthUser, resource: string): boolean {
  return canPerformAction(user, resource, 'update');
}

/**
 * Check if user can delete a resource
 */
export function canDelete(user: AuthUser, resource: string): boolean {
  return canPerformAction(user, resource, 'delete');
}
