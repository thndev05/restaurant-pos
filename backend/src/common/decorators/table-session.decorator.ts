import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tableSession;
  },
);
