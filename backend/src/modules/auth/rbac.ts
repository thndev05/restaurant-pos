/**
 * RBAC System Exports
 *
 * Import these in your controllers and services to use the RBAC system
 */

// Decorators
export { Roles } from './decorators/roles.decorator';
export { RequirePermissions } from './decorators/permissions.decorator';
export { Public } from './decorators/public.decorator';
export { CurrentUser } from './decorators/current-user.decorator';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';
export { PermissionsGuard } from './guards/permissions.guard';

// Types
export type { JwtPayload } from './strategies/jwt-payload.interface';

// Note: Import RoleName from generated Prisma client
// import { RoleName } from 'src/generated/prisma';
