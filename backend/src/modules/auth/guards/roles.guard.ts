import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from 'src/generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.log('RolesGuard: canActivate called');
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('RolesGuard: Public route, allow');
      return true;
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      this.logger.log('RolesGuard: No required roles, allow');
      return true;
    }

    interface RequestWithUser {
      user?: {
        role?: {
          name: RoleName;
        };
      };
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    // Check if user has required role
    return requiredRoles.some((role) => user?.role?.name === role);
  }
}
