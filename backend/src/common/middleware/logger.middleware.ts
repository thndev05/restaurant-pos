import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `${method} ${originalUrl} - ${ip} - ${userAgent.substring(0, 50)}`,
    );

    // Log response
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const responseTime = Date.now() - startTime;

      const statusText = statusCode >= 400 ? 'ERROR' : 'SUCCESS';

      this.logger.log(
        `${statusText} ${method} ${originalUrl} ${statusCode} ${contentLength}b - ${responseTime}ms`,
      );
    });

    next();
  }
}
