/**
 * Role definitions and permissions for the application
 */

export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface RolePermissions {
  canViewDashboard: boolean;
  canManageMenu: boolean;
  canManageTables: boolean;
  canManageStaff: boolean;
  canViewOrders: boolean;
  canManageOrders: boolean;
  canProcessPayments: boolean;
  canViewReports: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  [USER_ROLES.CUSTOMER]: {
    canViewDashboard: false,
    canManageMenu: false,
    canManageTables: false,
    canManageStaff: false,
    canViewOrders: false,
    canManageOrders: false,
    canProcessPayments: false,
    canViewReports: false,
  },
  [USER_ROLES.STAFF]: {
    canViewDashboard: false,
    canManageMenu: false,
    canManageTables: false,
    canManageStaff: false,
    canViewOrders: true,
    canManageOrders: true,
    canProcessPayments: false,
    canViewReports: false,
  },
  [USER_ROLES.CASHIER]: {
    canViewDashboard: false,
    canManageMenu: false,
    canManageTables: false,
    canManageStaff: false,
    canViewOrders: true,
    canManageOrders: true,
    canProcessPayments: true,
    canViewReports: false,
  },
  [USER_ROLES.KITCHEN]: {
    canViewDashboard: false,
    canManageMenu: false,
    canManageTables: false,
    canManageStaff: false,
    canViewOrders: true,
    canManageOrders: false,
    canProcessPayments: false,
    canViewReports: false,
  },
  [USER_ROLES.MANAGER]: {
    canViewDashboard: true,
    canManageMenu: true,
    canManageTables: true,
    canManageStaff: false,
    canViewOrders: true,
    canManageOrders: true,
    canProcessPayments: true,
    canViewReports: true,
  },
  [USER_ROLES.ADMIN]: {
    canViewDashboard: true,
    canManageMenu: true,
    canManageTables: true,
    canManageStaff: true,
    canViewOrders: true,
    canManageOrders: true,
    canProcessPayments: true,
    canViewReports: true,
  },
};

export const getRolePermissions = (role: UserRole): RolePermissions => {
  return rolePermissions[role];
};

export const isStaffRole = (role: UserRole): boolean => {
  const staffRoles: UserRole[] = [
    USER_ROLES.STAFF,
    USER_ROLES.CASHIER,
    USER_ROLES.KITCHEN,
    USER_ROLES.MANAGER,
    USER_ROLES.ADMIN,
  ];
  return staffRoles.includes(role);
};
