import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  AddOrderItemsDto,
  UpdateOrderItemDto,
  UpdateOrderStatusDto,
  UpdateOrderItemStatusDto,
  GetOrdersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Query() getOrdersDto: GetOrdersDto) {
    return this.ordersService.getOrders(getOrdersDto);
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Post(':id/items')
  async addOrderItems(
    @Param('id') id: string,
    @Body() addOrderItemsDto: AddOrderItemsDto,
  ) {
    return this.ordersService.addOrderItems(id, addOrderItemsDto);
  }

  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Patch('items/:itemId')
  async updateOrderItem(
    @Param('itemId') itemId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateOrderItem(itemId, updateOrderItemDto);
  }

  @Patch('items/:itemId/status')
  async updateOrderItemStatus(
    @Param('itemId') itemId: string,
    @Body() updateOrderItemStatusDto: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateOrderItemStatus(
      itemId,
      updateOrderItemStatusDto,
    );
  }

  @Delete('items/:itemId')
  async deleteOrderItem(@Param('itemId') itemId: string) {
    return this.ordersService.deleteOrderItem(itemId);
  }
}
