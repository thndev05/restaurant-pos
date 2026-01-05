import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TableSession as TableSessionType } from 'src/generated/prisma';

interface RequestWithTableSession {
  tableSession: TableSessionType;
}

/**
 * Decorator to extract table session from request
 * Use with TableSessionGuard
 *
 * @example
 * ```typescript
 * @UseGuards(TableSessionGuard)
 * @Post('customer/orders')
 * async createOrder(
 *   @TableSession() session: TableSession,
 *   @Body() dto: CreateOrderDto
 * ) {
 *   // session is validated and attached by TableSessionGuard
 * }
 * ```
 */
export const TableSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TableSessionType => {
    const request = ctx.switchToHttp().getRequest<RequestWithTableSession>();
    return request.tableSession;
  },
);
