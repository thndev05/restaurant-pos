import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from '../../modules/sessions/sessions.service';

/**
 * Guard to validate customer table session credentials
 * Checks X-Table-Session and X-Table-Secret headers
 * Attaches validated session to request object
 */
@Injectable()
export class TableSessionGuard implements CanActivate {
  constructor(private readonly sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const sessionId = request.headers['x-table-session'];
    const sessionSecret = request.headers['x-table-secret'];

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
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Invalid session credentials',
      );
    }
  }
}
