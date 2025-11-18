import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    interface RequestWithUser {
      user?: {
        role?: {
          permissions?: Array<{
            permission: {
              name: string;
            };
          }>;
        };
      };
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    // Get user's permissions from role
    const userPermissions: string[] =
      user?.role?.permissions?.map((rp) => rp.permission.name) || [];

    // Check if user has all required permissions
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
