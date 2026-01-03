/**
 * RBAC Authorization Helper Utilities
 *
 * This file contains utility functions for programmatic authorization checks
 * in your service layer or business logic.
 *
 * For controller-level authorization, use decorators:
 * - @Roles() for role-based access
 * - @RequirePermissions() for permission-based access
 * - @Public() for public routes
 *
 * Example usage in services:
 *
 * ```typescript
 * import { hasPermission, canDelete, isAdmin } from 'src/common/utils/authorization.util';
 *
 * async deleteMenuItem(user: AuthUser, id: string) {
 *   // Check if user can delete menu items
 *   if (!canDelete(user, 'menu-items')) {
 *     throw new ForbiddenException('You do not have permission to delete menu items');
 *   }
 *
 *   // Or check specific permission
 *   if (!hasPermission(user, 'menu-items.delete')) {
 *     throw new ForbiddenException('Permission denied');
 *   }
 *
 *   // Admins can delete anything
 *   if (isAdmin(user)) {
 *     // Special admin logic
 *   }
 *
 *   // Proceed with deletion
 *   return this.prisma.menuItem.delete({ where: { id } });
 * }
 * ```
 */

export * from './authorization.util';
export * from './transaction.util';

/**
 * Available Roles:
 * - ADMIN: Full system access
 * - MANAGER: Manage operations, reports, and staff
 * - CASHIER: Process orders and payments
 * - WAITER: Take orders and manage tables
 * - KITCHEN: View and update cooking orders
 *
 * Common Permission Patterns:
 * - {resource}.create - Create new records
 * - {resource}.read - View records
 * - {resource}.update - Modify existing records
 * - {resource}.delete - Remove records
 *
 * Resources:
 * - menu-items
 * - categories
 * - tables
 * - customers
 * - orders
 * - users
 * - roles
 * - payments
 * - kitchen
 * - reports
 *
 * Helper Functions:
 * - hasRole(user, role) - Check single role
 * - hasAnyRole(user, roles[]) - Check if user has any of the roles
 * - hasPermission(user, permission) - Check single permission
 * - hasAllPermissions(user, permissions[]) - Check multiple permissions
 * - canPerformAction(user, resource, action) - Check resource + action
 * - canRead/canCreate/canUpdate/canDelete(user, resource) - Shortcuts
 * - isAdmin(user) - Check if user is admin
 * - isManagerOrAbove(user) - Check if user is admin or manager
 */
