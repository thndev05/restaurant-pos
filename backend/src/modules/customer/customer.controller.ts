import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { TableSessionGuard } from 'src/common/guards/table-session.guard';
import { TableSession } from 'src/common/decorators/table-session.decorator';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { OrdersService } from '../orders/orders.service';
import { ActionsService } from '../actions/actions.service';
import { SessionsService } from '../sessions/sessions.service';
import { CreateOrderDto } from '../orders/dto';
import { CreateActionDto } from '../actions/dto';

/**
 * Customer-facing endpoints for QR-based table ordering
 * All endpoints require valid table session (X-Table-Session and X-Table-Secret headers)
 */
@Public()
@UseGuards(TableSessionGuard)
@Controller('customer')
export class CustomerController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly ordersService: OrdersService,
    private readonly actionsService: ActionsService,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Get available menu items for ordering
   */
  @Get('menu')
  async getAvailableMenu() {
    return this.menuItemsService.getMenuItems({});
  }

  /**
   * Get current session details with orders and actions
   */
  @Get('session')
  async getCurrentSession(@TableSession() session: any) {
    return this.sessionsService.getCustomerSession(session.id);
  }

  /**
   * Get session bill
   */
  @Get('session/bill')
  async getSessionBill(@TableSession() session: any) {
    return this.sessionsService.getSessionBill(session.id);
  }

  /**
   * Create a new order for the session
   */
  @Post('orders')
  async createOrder(
    @TableSession() session: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // Override sessionId from validated session
    const orderDto = {
      ...createOrderDto,
      orderType: 'DINE_IN' as const,
      sessionId: session.id,
    };

    console.log('\n========== CUSTOMER CREATE ORDER DEBUG ==========');
    console.log('Session Info:');
    console.log(`  Session ID: ${session.id}`);
    console.log(`  Table ID: ${session.tableId}`);
    console.log('Order DTO:');
    console.log(`  Order Type: ${orderDto.orderType}`);
    console.log(`  Session ID: ${orderDto.sessionId}`);
    console.log(`  Items Count: ${orderDto.items?.length || 0}`);
    console.log('=================================================\n');

    const result = await this.ordersService.createOrder(orderDto);

    console.log('\n========== ORDER CREATED RESULT ==========');
    console.log(`  Order ID: ${result.data.id}`);
    console.log(`  Order Status: ${result.data.status}`);
    console.log(`  Session ID: ${result.data.sessionId}`);
    console.log('==========================================\n');

    return result;
  }

  /**
   * Create a staff action (call waiter, request bill, etc.)
   */
  @Post('actions')
  async createAction(
    @TableSession() session: any,
    @Body() createActionDto: Omit<CreateActionDto, 'sessionId'>,
  ) {
    const actionDto: CreateActionDto = {
      ...createActionDto,
      sessionId: session.id,
    };

    return this.actionsService.createAction(actionDto);
  }

  /**
   * Get all actions for current session
   */
  @Get('actions')
  async getSessionActions(@TableSession() session: any) {
    return this.actionsService.getActionsBySessionId(session.id);
  }
}
