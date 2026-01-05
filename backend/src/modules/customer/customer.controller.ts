import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { TableSessionGuard } from 'src/common/guards/table-session.guard';
import { TableSession } from 'src/common/decorators/table-session.decorator';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { CategoriesService } from '../categories/categories.service';
import { OrdersService } from '../orders/orders.service';
import { ActionsService } from '../actions/actions.service';
import { SessionsService } from '../sessions/sessions.service';
import { CreateOrderDto } from '../orders/dto';
import { CreateActionDto } from '../actions/dto';
import type { TableSession as TableSessionType } from 'src/generated/prisma';

/**
 * Customer-facing endpoints for menu browsing and QR-based table ordering
 * Public endpoints (menu, categories) do not require authentication
 * Session endpoints require valid table session (X-Table-Session and X-Table-Secret headers)
 */
@Public()
@Controller('customer')
export class CustomerController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly categoriesService: CategoriesService,
    private readonly ordersService: OrdersService,
    private readonly actionsService: ActionsService,
    private readonly sessionsService: SessionsService,
  ) {}

  // ========== PUBLIC ENDPOINTS (No authentication required) ==========

  /**
   * Get all available menu items (public access)
   * Only returns items with isAvailable: true and isActive: true
   */
  @Get('menu')
  async getAvailableMenu() {
    const menuItems = await this.menuItemsService.getMenuItems({});

    // Filter only available items for customers
    return menuItems.filter((item) => item.isAvailable && item.isActive);
  }

  /**
   * Get single menu item by ID (public access)
   * Only returns if item is available and active
   */
  @Get('menu/:id')
  async getMenuItemById(@Param('id') id: string) {
    const menuItem = await this.menuItemsService.getMenuItemById(id);

    // Return 404 if item is not available for customers
    if (!menuItem.isAvailable || !menuItem.isActive) {
      throw new Error('Menu item not available');
    }

    return menuItem;
  }

  /**
   * Get all active categories with available menu items (public access)
   */
  @Get('categories')
  async getCategories() {
    const categories = await this.categoriesService.getCategories();

    // Filter categories and their menu items to only show available ones
    return categories.map((category) => ({
      ...category,
      menuItems: category.menuItems.filter(
        (item) => item.isAvailable && item.isActive,
      ),
    }));
  }

  /**
   * Get single category by ID with available menu items (public access)
   */
  @Get('categories/:id')
  async getCategoryById(@Param('id') id: string) {
    const category = await this.categoriesService.getCategoryById(id);

    // Filter menu items to only show available ones
    return {
      ...category,
      menuItems: category.menuItems.filter(
        (item) => item.isAvailable && item.isActive,
      ),
    };
  }

  // ========== PROTECTED ENDPOINTS (Require table session) ==========

  /**
   * Get current session details with orders and actions
   * Requires valid table session
   */
  @UseGuards(TableSessionGuard)
  @Get('session')
  async getCurrentSession(@TableSession() session: TableSessionType) {
    return this.sessionsService.getCustomerSession(session.id);
  }

  /**
   * Get session bill
   * Requires valid table session
   */
  @UseGuards(TableSessionGuard)
  @Get('session/bill')
  async getSessionBill(@TableSession() session: TableSessionType) {
    return this.sessionsService.getSessionBill(session.id);
  }

  /**
   * Create a new order for the session
   * Requires valid table session
   */
  @UseGuards(TableSessionGuard)
  @Post('orders')
  async createOrder(
    @TableSession() session: TableSessionType,
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
   * Requires valid table session
   */
  @UseGuards(TableSessionGuard)
  @Post('actions')
  async createAction(
    @TableSession() session: TableSessionType,
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
   * Requires valid table session
   */
  @UseGuards(TableSessionGuard)
  @Get('actions')
  async getSessionActions(@TableSession() session: TableSessionType) {
    return this.actionsService.getActionsBySessionId(session.id);
  }
}
