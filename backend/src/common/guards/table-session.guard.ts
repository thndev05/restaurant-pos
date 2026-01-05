import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from '../../modules/sessions/sessions.service';
import type { TableSession } from 'src/generated/prisma';
import { Request } from 'express';

interface RequestWithTableSession extends Request {
  tableSession?: TableSession;
}

/**
 * Guard to validate customer table session credentials
 * Checks X-Table-Session and X-Table-Secret headers
 * Attaches validated session to request object
 */
@Injectable()
export class TableSessionGuard implements CanActivate {
  constructor(private readonly sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTableSession>();

    const sessionId = request.headers['x-table-session'] as string | undefined;
    const sessionSecret = request.headers['x-table-secret'] as
      | string
      | undefined;

    if (!sessionId || !sessionSecret) {
      throw new UnauthorizedException(
        'Session credentials required. Please scan QR code to start a session.',
      );
    }

    try {
      // Validate session credentials
      const session = await this.sessionsService.validateSession(
        sessionId,
        sessionSecret,
      );

      // Attach session to request for use in controllers
      request.tableSession = session;

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid session credentials';
      throw new UnauthorizedException(errorMessage);
    }
  }
}
