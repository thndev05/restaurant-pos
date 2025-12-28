import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { OrdersModule } from '../orders/orders.module';
import { ActionsModule } from '../actions/actions.module';

@Module({
  imports: [SessionsModule, MenuItemsModule, OrdersModule, ActionsModule],
  controllers: [CustomerController],
})
export class CustomerModule {}
